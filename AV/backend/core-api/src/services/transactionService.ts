import { PrismaClient } from '@prisma/client';
import { TRANSACTION_CONFIG, BUSINESS_RULES, ERROR_CODES } from '@shared/index';

const prisma = new PrismaClient();

export class TransactionService {
  /**
   * Create a deposit transaction
   */
  static async createDeposit(
    userId: string,
    depositData: {
      accountId: string;
      amount: number;
      currency?: string;
      description: string;
      reference?: string;
    }
  ) {
    const { accountId, amount, currency = 'USD', description, reference } = depositData;

    // Validate amount
    if (amount < TRANSACTION_CONFIG.MIN_AMOUNT) {
      throw new Error(`Minimum deposit amount is ${TRANSACTION_CONFIG.MIN_AMOUNT}`);
    }

    if (amount > TRANSACTION_CONFIG.MAX_AMOUNT) {
      throw new Error(`Maximum deposit amount is ${TRANSACTION_CONFIG.MAX_AMOUNT}`);
    }

    // Verify account ownership and status
    await this.verifyAccountAccess(accountId, userId);

    // Create transaction and update balance
    const result = await prisma.$transaction(async (tx: any) => {
      const transaction = await tx.transaction.create({
        data: {
          accountId,
          type: 'DEPOSIT',
          amount,
          currency,
          status: 'COMPLETED',
          description,
          reference: reference || `DEP-${Date.now()}`,
          metadata: {
            userId,
            ipAddress: null, // Should be passed from request
            userAgent: null, // Should be passed from request
          },
        },
      });

      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: amount },
          lastTransactionAt: new Date(),
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'DEPOSIT_CREATED',
          entityType: 'TRANSACTION',
          entityId: transaction.id,
          details: {
            accountId,
            amount,
            currency,
            description,
          },
        },
      });

      return transaction;
    });

    return result;
  }

  /**
   * Create a withdrawal transaction
   */
  static async createWithdrawal(
    userId: string,
    withdrawalData: {
      accountId: string;
      amount: number;
      currency?: string;
      description: string;
      reference?: string;
    }
  ) {
    const { accountId, amount, currency = 'USD', description, reference } = withdrawalData;

    // Validate amount
    if (amount < TRANSACTION_CONFIG.MIN_AMOUNT) {
      throw new Error(`Minimum withdrawal amount is ${TRANSACTION_CONFIG.MIN_AMOUNT}`);
    }

    if (amount > TRANSACTION_CONFIG.MAX_AMOUNT) {
      throw new Error(`Maximum withdrawal amount is ${TRANSACTION_CONFIG.MAX_AMOUNT}`);
    }

    // Verify account ownership and status
    const account = await this.verifyAccountAccess(accountId, userId);

    // Check sufficient balance - convert Decimal to number if needed
    const balance =
      typeof account.balance === 'object' && 'toNumber' in account.balance
        ? account.balance.toNumber()
        : Number(account.balance);

    if (balance < amount) {
      throw new Error('Insufficient funds');
    }

    // Check daily limit
    await this.checkDailyLimit(accountId, amount, 'WITHDRAWAL');

    // Check monthly limit
    await this.checkMonthlyLimit(accountId, amount, 'WITHDRAWAL');

    // Fraud detection checks
    await this.performFraudChecks(userId, accountId, amount, 'WITHDRAWAL');

    // Create transaction and update balance
    const result = await prisma.$transaction(async (tx: any) => {
      const transaction = await tx.transaction.create({
        data: {
          accountId,
          type: 'WITHDRAWAL',
          amount,
          currency,
          status: 'COMPLETED',
          description,
          reference: reference || `WTH-${Date.now()}`,
          metadata: {
            userId,
            ipAddress: null,
            userAgent: null,
          },
        },
      });

      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: { decrement: amount },
          lastTransactionAt: new Date(),
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'WITHDRAWAL_CREATED',
          entityType: 'TRANSACTION',
          entityId: transaction.id,
          details: {
            accountId,
            amount,
            currency,
            description,
          },
        },
      });

      return transaction;
    });

    return result;
  }

  /**
   * Create a transfer transaction
   */
  static async createTransfer(
    userId: string,
    transferData: {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      currency?: string;
      description: string;
      reference?: string;
    }
  ) {
    const {
      fromAccountId,
      toAccountId,
      amount,
      currency = 'USD',
      description,
      reference,
    } = transferData;

    if (fromAccountId === toAccountId) {
      throw new Error('Cannot transfer to the same account');
    }

    // Validate amount
    if (amount < TRANSACTION_CONFIG.MIN_AMOUNT) {
      throw new Error(`Minimum transfer amount is ${TRANSACTION_CONFIG.MIN_AMOUNT}`);
    }

    if (amount > TRANSACTION_CONFIG.MAX_AMOUNT) {
      throw new Error(`Maximum transfer amount is ${TRANSACTION_CONFIG.MAX_AMOUNT}`);
    }

    // Verify source account ownership and status
    const fromAccount = await this.verifyAccountAccess(fromAccountId, userId);

    // Verify destination account exists and is active
    const toAccount = await prisma.account.findFirst({
      where: { id: toAccountId, status: 'ACTIVE' },
    });

    if (!toAccount) {
      throw new Error('Destination account not found or inactive');
    }

    // Check sufficient balance - convert Decimal to number if needed
    const fromBalance =
      typeof fromAccount.balance === 'object' && 'toNumber' in fromAccount.balance
        ? fromAccount.balance.toNumber()
        : Number(fromAccount.balance);

    if (fromBalance < amount) {
      throw new Error('Insufficient funds');
    }

    // Check daily limit
    await this.checkDailyLimit(fromAccountId, amount, 'TRANSFER');

    // Check monthly limit
    await this.checkMonthlyLimit(fromAccountId, amount, 'TRANSFER');

    // Fraud detection checks
    await this.performFraudChecks(userId, fromAccountId, amount, 'TRANSFER');

    const transferRef = reference || `TRF-${Date.now()}`;

    // Create transfer transactions
    const result = await prisma.$transaction(async (tx: any) => {
      // Debit from source account
      const debitTransaction = await tx.transaction.create({
        data: {
          accountId: fromAccountId,
          type: 'TRANSFER',
          amount: -amount,
          currency,
          status: 'COMPLETED',
          description: `Transfer to ${toAccount.accountNumber}: ${description}`,
          reference: transferRef,
          metadata: {
            userId,
            transferType: 'DEBIT',
            relatedAccountId: toAccountId,
          },
        },
      });

      // Credit to destination account
      const creditTransaction = await tx.transaction.create({
        data: {
          accountId: toAccountId,
          type: 'TRANSFER',
          amount: amount,
          currency,
          status: 'COMPLETED',
          description: `Transfer from ${fromAccount.accountNumber}: ${description}`,
          reference: transferRef,
          metadata: {
            userId,
            transferType: 'CREDIT',
            relatedAccountId: fromAccountId,
          },
        },
      });

      // Update account balances
      await tx.account.update({
        where: { id: fromAccountId },
        data: {
          balance: { decrement: amount },
          lastTransactionAt: new Date(),
        },
      });

      await tx.account.update({
        where: { id: toAccountId },
        data: {
          balance: { increment: amount },
          lastTransactionAt: new Date(),
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'TRANSFER_CREATED',
          entityType: 'TRANSACTION',
          entityId: debitTransaction.id,
          details: {
            fromAccountId,
            toAccountId,
            amount,
            currency,
            description,
            reference: transferRef,
          },
        },
      });

      return [debitTransaction, creditTransaction];
    });

    return result;
  }

  /**
   * Get user transactions with pagination and filtering
   */
  static async getUserTransactions(
    userId: string,
    filters: {
      page?: number;
      limit?: number;
      accountId?: string;
      type?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const { page = 1, limit = 20, accountId, type, status, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    // Get user's account IDs
    const userAccounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });

    const accountIds = userAccounts.map((acc: any) => acc.id);

    if (accountIds.length === 0) {
      return {
        transactions: [],
        pagination: { page, limit, total: 0, pages: 0 },
      };
    }

    const where: any = {
      accountId: { in: accountId ? [accountId] : accountIds },
    };

    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: {
              accountNumber: true,
              accountType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(transactionId: string, userId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        account: { userId },
      },
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new Error(ERROR_CODES.TRANSACTION_NOT_FOUND);
    }

    return transaction;
  }

  /**
   * Get transaction statistics
   */
  static async getTransactionStats(userId: string, period: 'week' | 'month' | 'year' = 'month') {
    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // month
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get user's account IDs
    const userAccounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });

    const accountIds = userAccounts.map((acc: any) => acc.id);

    if (accountIds.length === 0) {
      return {
        totalTransactions: 0,
        totalAmount: 0,
        deposits: 0,
        withdrawals: 0,
        transfers: 0,
        byType: { DEPOSIT: 0, WITHDRAWAL: 0, TRANSFER: 0, PAYMENT: 0 },
      };
    }

    const where = {
      accountId: { in: accountIds },
      createdAt: { gte: startDate },
      status: 'COMPLETED',
    };

    const [stats, typeStats] = await Promise.all([
      prisma.transaction.aggregate({
        where,
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ['type'],
        where,
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    const byType = { DEPOSIT: 0, WITHDRAWAL: 0, TRANSFER: 0, PAYMENT: 0 };
    let deposits = 0,
      withdrawals = 0,
      transfers = 0;

    typeStats.forEach((stat: any) => {
      byType[stat.type as keyof typeof byType] = stat._count.id;
      const amount = stat._sum.amount || 0;

      switch (stat.type) {
        case 'DEPOSIT':
          deposits += amount;
          break;
        case 'WITHDRAWAL':
          withdrawals += Math.abs(amount);
          break;
        case 'TRANSFER':
          transfers += Math.abs(amount);
          break;
      }
    });

    return {
      totalTransactions: stats._count.id,
      totalAmount: stats._sum.amount || 0,
      deposits,
      withdrawals,
      transfers,
      byType,
    };
  }

  /**
   * Verify account access for user
   */
  private static async verifyAccountAccess(accountId: string, userId: string) {
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!account) {
      throw new Error('Account not found, inactive, or access denied');
    }

    return account;
  }

  /**
   * Check daily transaction limit
   */
  private static async checkDailyLimit(accountId: string, amount: number, _type: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = await prisma.transaction.aggregate({
      where: {
        accountId,
        type: { in: ['WITHDRAWAL', 'TRANSFER'] },
        status: 'COMPLETED',
        createdAt: { gte: today },
      },
      _sum: { amount: true },
    });

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { dailyLimit: true },
    });

    // Convert Decimal to number if needed
    const sumAmount = todayTransactions._sum.amount;
    const dailySpent = sumAmount
      ? typeof sumAmount === 'object' && 'toNumber' in sumAmount
        ? sumAmount.toNumber()
        : Number(sumAmount)
      : 0;
    const todayTotal = Math.abs(dailySpent) + amount;

    // Convert account limit to number if needed
    const accountLimit = account?.dailyLimit;
    const dailyLimit = accountLimit
      ? typeof accountLimit === 'object' && 'toNumber' in accountLimit
        ? accountLimit.toNumber()
        : Number(accountLimit)
      : TRANSACTION_CONFIG.DAILY_LIMIT;

    if (todayTotal > dailyLimit) {
      throw new Error(`Daily transaction limit exceeded`);
    }
  }

  /**
   * Check monthly transaction limit
   */
  private static async checkMonthlyLimit(accountId: string, amount: number, _type: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyTransactions = await prisma.transaction.aggregate({
      where: {
        accountId,
        type: { in: ['WITHDRAWAL', 'TRANSFER'] },
        status: 'COMPLETED',
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    });

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { monthlyLimit: true },
    });

    // Convert Decimal to number if needed
    const sumAmount = monthlyTransactions._sum.amount;
    const monthlySpent = sumAmount
      ? typeof sumAmount === 'object' && 'toNumber' in sumAmount
        ? sumAmount.toNumber()
        : Number(sumAmount)
      : 0;
    const monthlyTotal = Math.abs(monthlySpent) + amount;

    // Convert account limit to number if needed
    const accountLimit = account?.monthlyLimit;
    const monthlyLimit = accountLimit
      ? typeof accountLimit === 'object' && 'toNumber' in accountLimit
        ? accountLimit.toNumber()
        : Number(accountLimit)
      : TRANSACTION_CONFIG.MONTHLY_LIMIT;

    if (monthlyTotal > monthlyLimit) {
      throw new Error(`Monthly transaction limit exceeded`);
    }
  }

  /**
   * Perform fraud detection checks
   */
  private static async performFraudChecks(
    userId: string,
    accountId: string,
    amount: number,
    type: string
  ) {
    // Check for suspicious amount
    if (amount >= BUSINESS_RULES.FRAUD_DETECTION.SUSPICIOUS_AMOUNT_THRESHOLD) {
      // Log suspicious activity
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'SUSPICIOUS_TRANSACTION_DETECTED',
          entityType: 'TRANSACTION',
          entityId: accountId,
          details: JSON.stringify({
            amount,
            type,
            reason: 'Large amount transaction',
          }),
        },
      });
    }

    // Check transaction velocity
    const velocityWindow = new Date(
      Date.now() - BUSINESS_RULES.FRAUD_DETECTION.VELOCITY_CHECK_WINDOW
    );

    const recentTransactions = await prisma.transaction.count({
      where: {
        accountId,
        type: { in: ['WITHDRAWAL', 'TRANSFER'] },
        status: 'COMPLETED',
        createdAt: { gte: velocityWindow },
      },
    });

    if (recentTransactions >= BUSINESS_RULES.FRAUD_DETECTION.MAX_DAILY_TRANSACTIONS) {
      throw new Error('Transaction velocity limit exceeded. Please try again later.');
    }
  }

  /**
   * Process pending transactions (for scheduled/batch processing)
   */
  static async processPendingTransactions() {
    const pendingTransactions = await prisma.transaction.findMany({
      where: { status: 'PENDING' },
      include: { account: true },
    });

    const results = [];

    for (const transaction of pendingTransactions) {
      try {
        await prisma.$transaction(async (tx: any) => {
          // Update transaction status
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: 'COMPLETED',
              processedAt: new Date(),
            },
          });

          // Update account balance based on transaction type
          // Convert Decimal to number if needed
          const amount =
            typeof transaction.amount === 'object' && 'toNumber' in transaction.amount
              ? transaction.amount.toNumber()
              : Number(transaction.amount);

          const balanceChange = transaction.type === 'DEPOSIT' ? amount : -Math.abs(amount);

          await tx.account.update({
            where: { id: transaction.accountId },
            data: {
              balance: {
                increment: balanceChange,
              },
            },
          });
        });

        results.push({
          id: transaction.id,
          status: 'COMPLETED',
          message: 'Transaction processed successfully',
        });
      } catch (error) {
        results.push({
          id: transaction.id,
          status: 'FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }
}
