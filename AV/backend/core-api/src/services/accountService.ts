import { PrismaClient } from '@prisma/client';
import { ACCOUNT_CONFIG, BUSINESS_RULES, ERROR_CODES } from '../../shared/index';
import { cache, CacheKeys, CacheTTL } from './cacheService';

const prisma = new PrismaClient();

export class AccountService {
  /**
   * Get account transactions with pagination
   */
  static async getAccountTransactions(
    accountId: string,
    userId: string,
    filters: {
      page?: number;
      limit?: number;
      type?: string;
      status?: string;
    }
  ) {
    // Verify account ownership
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new Error(ERROR_CODES.ACCOUNT_NOT_FOUND);
    }

    const { page = 1, limit = 20, type, status } = filters;
    const where: any = { accountId };

    if (type) where.type = type;
    if (status) where.status = status;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        select: {
          id: true,
          type: true,
          amount: true,
          currency: true,
          status: true,
          description: true,
          reference: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
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
   * Get account balance details including pending transactions
   */
  static async getAccountBalance(accountId: string, userId: string) {
    // Try to get from cache first
    const cacheKey = CacheKeys.accountBalance(accountId);
    const cached = await cache.get<{
      balance: number;
      currency: string;
      availableBalance: number;
      pendingTransactions: number;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    // Fetch from database
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
      select: {
        balance: true,
        currency: true,
      },
    });

    if (!account) {
      throw new Error(ERROR_CODES.ACCOUNT_NOT_FOUND);
    }

    // Calculate pending transactions
    const pendingTransactions = await prisma.transaction.aggregate({
      where: {
        accountId,
        status: 'PENDING',
      },
      _sum: {
        amount: true,
      },
    });

    const pendingAmount = pendingTransactions._sum.amount ? Number(pendingTransactions._sum.amount) : 0;
    const balance = typeof account.balance === 'object' && 'toNumber' in account.balance
      ? (account.balance as any).toNumber()
      : Number(account.balance);
    const availableBalance = balance - pendingAmount;

    const result = {
      balance,
      currency: account.currency,
      availableBalance,
      pendingTransactions: pendingAmount,
    };

    // Cache for 1 minute (balance changes frequently)
    await cache.set(cacheKey, result, CacheTTL.SHORT);

    return result;
  }

  /**
   * Create a new account for a user
   */
  static async createAccount(
    userId: string,
    accountData: {
      accountType: 'CHECKING' | 'SAVINGS' | 'PREMIUM';
      initialDeposit?: number;
    }
  ) {
    // Check if user exists and is verified
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        kycStatus: true,
        status: true,
        _count: {
          select: { accounts: true },
        },
      },
    });

    if (!user) {
      throw new Error(ERROR_CODES.USER_NOT_FOUND);
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('User account is not active');
    }

    if (user.kycStatus !== 'VERIFIED') {
      throw new Error('KYC verification required to create account');
    }

    // Check account limit
    if (user._count.accounts >= BUSINESS_RULES.MAX_ACCOUNTS_PER_USER) {
      throw new Error(
        `Maximum of ${BUSINESS_RULES.MAX_ACCOUNTS_PER_USER} accounts allowed per user`
      );
    }

    // Generate unique account number
    const accountNumber = await this.generateAccountNumber();

    // Set account-specific configurations
    const accountConfig = this.getAccountConfig(accountData.accountType);

    // Create account
    const account = await prisma.account.create({
      data: {
        userId,
        accountNumber,
        accountType: accountData.accountType,
        balance: accountData.initialDeposit || 0,
        currency: 'USD',
        status: 'ACTIVE',
        ...accountConfig,
      },
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        balance: true,
        currency: true,
        status: true,
        interestRate: true,
        dailyLimit: true,
        monthlyLimit: true,
        createdAt: true,
      },
    });

    // Create initial deposit transaction if provided
    if (accountData.initialDeposit && accountData.initialDeposit > 0) {
      await prisma.transaction.create({
        data: {
          accountId: account.id,
          type: 'DEPOSIT',
          amount: accountData.initialDeposit,
          currency: 'USD',
          status: 'COMPLETED',
          description: 'Initial deposit',
          reference: `INIT-${Date.now()}`,
        },
      });
    }

    return account;
  }

  /**
   * Get user accounts
   */
  static async getUserAccounts(userId: string) {
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        balance: true,
        currency: true,
        status: true,
        interestRate: true,
        dailyLimit: true,
        monthlyLimit: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return accounts;
  }

  /**
   * Get account by ID
   */
  static async getAccountById(accountId: string, userId?: string) {
    const where: any = { id: accountId };
    if (userId) where.userId = userId;

    const account = await prisma.account.findFirst({
      where,
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        balance: true,
        currency: true,
        status: true,
        interestRate: true,
        dailyLimit: true,
        monthlyLimit: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!account) {
      throw new Error(ERROR_CODES.ACCOUNT_NOT_FOUND);
    }

    return account;
  }

  /**
   * Update account settings
   */
  static async updateAccount(
    accountId: string,
    userId: string,
    updateData: {
      dailyLimit?: number;
      monthlyLimit?: number;
      status?: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
    }
  ) {
    // Verify account ownership
    const existingAccount = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!existingAccount) {
      throw new Error(ERROR_CODES.ACCOUNT_NOT_FOUND);
    }

    const account = await prisma.account.update({
      where: { id: accountId },
      data: updateData,
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        balance: true,
        currency: true,
        status: true,
        interestRate: true,
        dailyLimit: true,
        monthlyLimit: true,
        updatedAt: true,
      },
    });

    return account;
  }

  /**
   * Close account
   */
  static async closeAccount(accountId: string, userId: string, reason?: string) {
    // Verify account ownership
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
      select: { balance: true, status: true },
    });

    if (!account) {
      throw new Error(ERROR_CODES.ACCOUNT_NOT_FOUND);
    }

    if (account.status === 'CLOSED') {
      throw new Error('Account is already closed');
    }

    const balanceNumber =
      typeof account.balance === 'object' && 'toNumber' in account.balance
        ? account.balance.toNumber()
        : Number(account.balance);

    if (balanceNumber > 0) {
      throw new Error(
        'Cannot close account with positive balance. Please withdraw all funds first.'
      );
    }

    if (balanceNumber < 0) {
      throw new Error('Cannot close account with negative balance. Please settle the debt first.');
    }

    const closedAccount = await prisma.account.update({
      where: { id: accountId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        ...(reason && { closureReason: reason }),
      },
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        balance: true,
        status: true,
        closedAt: true,
        updatedAt: true,
      },
    });

    return closedAccount;
  }

  /**
   * Get account balance and recent transactions
   */
  static async getAccountSummary(accountId: string, userId: string) {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        balance: true,
        currency: true,
        status: true,
        interestRate: true,
        dailyLimit: true,
        monthlyLimit: true,
      },
    });

    if (!account) {
      throw new Error(ERROR_CODES.ACCOUNT_NOT_FOUND);
    }

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { accountId },
      select: {
        id: true,
        type: true,
        amount: true,
        currency: true,
        status: true,
        description: true,
        reference: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate daily spending
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySpending = await prisma.transaction.aggregate({
      where: {
        accountId,
        type: { in: ['WITHDRAWAL', 'TRANSFER'] },
        status: 'COMPLETED',
        createdAt: { gte: today },
      },
      _sum: { amount: true },
    });

    // Calculate monthly spending
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthlySpending = await prisma.transaction.aggregate({
      where: {
        accountId,
        type: { in: ['WITHDRAWAL', 'TRANSFER'] },
        status: 'COMPLETED',
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    });

    return {
      account,
      recentTransactions,
      spending: {
        today: Math.abs(
          todaySpending._sum.amount &&
            typeof todaySpending._sum.amount === 'object' &&
            'toNumber' in todaySpending._sum.amount
            ? todaySpending._sum.amount.toNumber()
            : Number(todaySpending._sum.amount || 0)
        ),
        month: Math.abs(
          monthlySpending._sum.amount &&
            typeof monthlySpending._sum.amount === 'object' &&
            'toNumber' in monthlySpending._sum.amount
            ? monthlySpending._sum.amount.toNumber()
            : Number(monthlySpending._sum.amount || 0)
        ),
        dailyRemaining: Math.max(
          0,
          (typeof account.dailyLimit === 'object' && 'toNumber' in account.dailyLimit
            ? account.dailyLimit.toNumber()
            : Number(account.dailyLimit)) -
          Math.abs(
            todaySpending._sum.amount &&
              typeof todaySpending._sum.amount === 'object' &&
              'toNumber' in todaySpending._sum.amount
              ? todaySpending._sum.amount.toNumber()
              : Number(todaySpending._sum.amount || 0)
          )
        ),
        monthlyRemaining: Math.max(
          0,
          (typeof account.monthlyLimit === 'object' && 'toNumber' in account.monthlyLimit
            ? account.monthlyLimit.toNumber()
            : Number(account.monthlyLimit)) -
          Math.abs(
            monthlySpending._sum.amount &&
              typeof monthlySpending._sum.amount === 'object' &&
              'toNumber' in monthlySpending._sum.amount
              ? monthlySpending._sum.amount.toNumber()
              : Number(monthlySpending._sum.amount || 0)
          )
        ),
      },
    };
  }

  /**
   * Generate unique account number
   */
  private static async generateAccountNumber(): Promise<string> {
    let accountNumber: string;
    let isUnique = false;

    do {
      // Generate random digits
      const randomDigits = Math.floor(Math.random() * 10000000000000000)
        .toString()
        .padStart(14, '0');
      accountNumber = `${ACCOUNT_CONFIG.ACCOUNT_NUMBER_PREFIX}${randomDigits}`;

      // Check if account number already exists
      const existing = await prisma.account.findUnique({
        where: { accountNumber },
      });

      isUnique = !existing;
    } while (!isUnique);

    return accountNumber;
  }

  /**
   * Get account configuration based on type
   */
  private static getAccountConfig(accountType: 'CHECKING' | 'SAVINGS' | 'PREMIUM') {
    switch (accountType) {
      case 'CHECKING':
        return {
          interestRate: ACCOUNT_CONFIG.CHECKING_INTEREST_RATE,
          dailyLimit: 5000,
          monthlyLimit: 50000,
          overdraftLimit: ACCOUNT_CONFIG.OVERDRAFT_LIMIT,
        };
      case 'SAVINGS':
        return {
          interestRate: ACCOUNT_CONFIG.SAVINGS_INTEREST_RATE,
          dailyLimit: 2000,
          monthlyLimit: 20000,
          overdraftLimit: 0,
        };
      case 'PREMIUM':
        return {
          interestRate: ACCOUNT_CONFIG.PREMIUM_INTEREST_RATE,
          dailyLimit: 25000,
          monthlyLimit: 250000,
          overdraftLimit: -2000,
        };
      default:
        throw new Error('Invalid account type');
    }
  }

  /**
   * Get all accounts with pagination and filtering (admin)
   */
  static async getAllAccounts(filters: {
    page?: number;
    limit?: number;
    accountType?: string;
    status?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, accountType, status, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (accountType) where.accountType = accountType;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { accountNumber: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        select: {
          id: true,
          accountNumber: true,
          accountType: true,
          balance: true,
          currency: true,
          status: true,
          interestRate: true,
          dailyLimit: true,
          monthlyLimit: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              transactions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.account.count({ where }),
    ]);

    return {
      accounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Calculate and apply interest to savings accounts
   */
  static async applyInterest() {
    const savingsAccounts = await prisma.account.findMany({
      where: {
        accountType: { in: ['SAVINGS', 'PREMIUM'] },
        status: 'ACTIVE',
        balance: { gt: 0 },
      },
    });

    const results = [];

    for (const account of savingsAccounts) {
      // Calculate daily interest (annual rate / 365)
      const interestRate =
        typeof account.interestRate === 'object' && 'toNumber' in account.interestRate
          ? account.interestRate.toNumber()
          : Number(account.interestRate);
      const balance =
        typeof account.balance === 'object' && 'toNumber' in account.balance
          ? account.balance.toNumber()
          : Number(account.balance);
      const dailyRate = interestRate / 365;
      const interestAmount = balance * dailyRate;

      if (interestAmount > 0.01) {
        // Only apply if interest is at least 1 cent
        await prisma.$transaction(async (tx: any) => {
          // Create interest transaction
          await tx.transaction.create({
            data: {
              accountId: account.id,
              type: 'DEPOSIT',
              amount: interestAmount,
              currency: 'USD',
              status: 'COMPLETED',
              description: 'Interest earned',
              reference: `INT-${Date.now()}`,
            },
          });

          // Update account balance
          await tx.account.update({
            where: { id: account.id },
            data: {
              balance: {
                increment: interestAmount,
              },
            },
          });
        });

        results.push({
          accountId: account.id,
          accountNumber: account.accountNumber,
          interestAmount,
        });
      }
    }

    return results;
  }
}
