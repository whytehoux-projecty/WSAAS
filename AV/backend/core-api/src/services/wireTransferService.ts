import { PrismaClient } from '@prisma/client';
import { ERROR_CODES, WIRE_TRANSFER_CONFIG } from '@shared/index';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class WireTransferService {
  /**
   * Create a wire transfer
   */
  static async createWireTransfer(
    userId: string,
    transferData: {
      senderAccountId: string;
      amount: number;
      currency?: string;
      recipientName: string;
      recipientBankName: string;
      recipientBankSwift?: string;
      recipientAccountNumber: string;
      recipientAddress?: string;
      purposeCode?: string;
      regulatoryInfo?: string;
    }
  ) {
    const {
      senderAccountId,
      amount,
      currency = 'USD',
      recipientName,
      recipientBankName,
      recipientBankSwift,
      recipientAccountNumber,
      recipientAddress,
      purposeCode,
      regulatoryInfo,
    } = transferData;

    // Validate amount
    if (amount < WIRE_TRANSFER_CONFIG.MIN_AMOUNT) {
      throw new Error(`Minimum wire transfer amount is ${WIRE_TRANSFER_CONFIG.MIN_AMOUNT}`);
    }

    if (amount > WIRE_TRANSFER_CONFIG.MAX_AMOUNT) {
      throw new Error(`Maximum wire transfer amount is ${WIRE_TRANSFER_CONFIG.MAX_AMOUNT}`);
    }

    // Verify account ownership and status
    const account = await prisma.account.findFirst({
      where: { id: senderAccountId, userId, status: 'ACTIVE' },
      include: { user: true },
    });

    if (!account) {
      throw new Error(ERROR_CODES.ACCOUNT_NOT_FOUND);
    }

    // Check KYC status for wire transfers
    if (account.user.kycStatus !== 'VERIFIED') {
      throw new Error('KYC verification required for wire transfers');
    }

    // Check sufficient balance including fees
    const fee = await this.calculateWireTransferFee(amount, currency);
    const totalAmount = amount + fee;

    if (account.balance.toNumber() < totalAmount) {
      throw new Error('Insufficient funds including wire transfer fee');
    }

    // Check daily wire transfer limit
    await this.checkDailyWireTransferLimit(senderAccountId, amount);

    // Generate unique reference
    const reference = this.generateWireTransferReference();

    // Create wire transfer and transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create main transaction
      const transaction = await tx.transaction.create({
        data: {
          accountId: senderAccountId,
          type: 'WIRE_TRANSFER',
          amount: totalAmount,
          currency,
          status: 'PENDING',
          description: `Wire transfer to ${recipientName}`,
          reference,
          metadata: JSON.stringify({
            userId,
            wireTransferAmount: amount,
            wireTransferFee: fee,
          }),
        },
      });

      // Create wire transfer record
      const wireTransfer = await tx.wireTransfer.create({
        data: {
          transactionId: transaction.id,
          senderAccountId,
          recipientName,
          recipientBankName,
          recipientBankSwift,
          recipientAccountNumber,
          recipientAddress,
          purposeCode,
          regulatoryInfo,
          fee,
          complianceStatus: 'PENDING',
          estimatedArrival: this.calculateEstimatedArrival(currency),
        },
      });

      // Deduct amount from sender account
      await tx.account.update({
        where: { id: senderAccountId },
        data: {
          balance: { decrement: totalAmount },
          lastTransactionAt: new Date(),
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'WIRE_TRANSFER_CREATED',
          entityType: 'WIRE_TRANSFER',
          entityId: wireTransfer.id,
          details: JSON.stringify({
            amount,
            currency,
            recipientName,
            recipientBankName,
            reference,
          }),
          category: 'TRANSACTION',
          severity: 'INFO',
        },
      });

      return { transaction, wireTransfer };
    });

    return result;
  }

  /**
   * Get wire transfers for user
   */
  static async getUserWireTransfers(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
    } = {}
  ) {
    const { page = 1, limit = 20, status } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      senderAccount: { userId },
    };

    if (status) {
      where.transaction = { status };
    }

    const [wireTransfers, total] = await Promise.all([
      prisma.wireTransfer.findMany({
        where,
        include: {
          transaction: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
              reference: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          senderAccount: {
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
      prisma.wireTransfer.count({ where }),
    ]);

    return {
      wireTransfers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get wire transfer by ID
   */
  static async getWireTransferById(wireTransferId: string, userId: string) {
    const wireTransfer = await prisma.wireTransfer.findFirst({
      where: {
        id: wireTransferId,
        senderAccount: { userId },
      },
      include: {
        transaction: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            reference: true,
            description: true,
            processedAt: true,
            failureReason: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        senderAccount: {
          select: {
            accountNumber: true,
            accountType: true,
          },
        },
      },
    });

    if (!wireTransfer) {
      throw new Error(ERROR_CODES.WIRE_TRANSFER_NOT_FOUND);
    }

    return wireTransfer;
  }

  /**
   * Cancel wire transfer
   */
  static async cancelWireTransfer(wireTransferId: string, userId: string) {
    const wireTransfer = await prisma.wireTransfer.findFirst({
      where: {
        id: wireTransferId,
        senderAccount: { userId },
      },
      include: {
        transaction: true,
        senderAccount: true,
      },
    });

    if (!wireTransfer) {
      throw new Error(ERROR_CODES.WIRE_TRANSFER_NOT_FOUND);
    }

    if (wireTransfer.transaction.status !== 'PENDING') {
      throw new Error('Can only cancel pending wire transfers');
    }

    // Cancel wire transfer and refund amount
    const result = await prisma.$transaction(async (tx: any) => {
      // Update transaction status
      await tx.transaction.update({
        where: { id: wireTransfer.transactionId },
        data: {
          status: 'CANCELLED',
          failureReason: 'Cancelled by user',
        },
      });

      // Refund amount to sender account
      await tx.account.update({
        where: { id: wireTransfer.senderAccountId },
        data: {
          balance: { increment: wireTransfer.transaction.amount },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'WIRE_TRANSFER_CANCELLED',
          entityType: 'WIRE_TRANSFER',
          entityId: wireTransferId,
          details: JSON.stringify({
            reference: wireTransfer.transaction.reference,
            refundAmount: wireTransfer.transaction.amount,
          }),
          category: 'TRANSACTION',
          severity: 'INFO',
        },
      });

      return wireTransfer;
    });

    return result;
  }

  /**
   * Calculate wire transfer fee
   */
  static async calculateWireTransferFee(amount: number, currency: string = 'USD'): Promise<number> {
    // Base fee
    let fee: number = WIRE_TRANSFER_CONFIG.BASE_FEE;

    // Percentage fee
    const percentageFee = amount * WIRE_TRANSFER_CONFIG.PERCENTAGE_FEE;
    fee += percentageFee;

    // Currency-specific fees
    if (currency !== 'USD') {
      fee += WIRE_TRANSFER_CONFIG.FOREIGN_CURRENCY_FEE;
    }

    // Apply maximum fee cap
    fee = Math.min(fee, WIRE_TRANSFER_CONFIG.MAX_FEE);

    return Math.round(fee * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Generate wire transfer reference
   */
  static generateWireTransferReference(): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `WT${timestamp.slice(-8)}${random}`;
  }

  /**
   * Calculate estimated arrival time
   */
  private static calculateEstimatedArrival(currency: string): Date {
    const now = new Date();
    let businessDays: number = WIRE_TRANSFER_CONFIG.DOMESTIC_PROCESSING_DAYS;

    if (currency !== 'USD') {
      businessDays = WIRE_TRANSFER_CONFIG.INTERNATIONAL_PROCESSING_DAYS;
    }

    // Add business days (excluding weekends)
    let daysAdded = 0;
    while (daysAdded < businessDays) {
      now.setDate(now.getDate() + 1);
      const dayOfWeek = now.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Not Sunday or Saturday
        daysAdded++;
      }
    }

    return now;
  }

  /**
   * Check daily wire transfer limit
   */
  private static async checkDailyWireTransferLimit(accountId: string, amount: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransfers = await prisma.wireTransfer.findMany({
      where: {
        senderAccountId: accountId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        transaction: {
          status: { in: ['PENDING', 'COMPLETED'] },
        },
      },
      include: {
        transaction: {
          select: { amount: true },
        },
      },
    });

    const todayTotal = todayTransfers.reduce(
      (sum: number, transfer: any) => sum + Number(transfer.transaction.amount),
      0
    );

    if (todayTotal + amount > WIRE_TRANSFER_CONFIG.DAILY_LIMIT) {
      throw new Error(`Daily wire transfer limit of ${WIRE_TRANSFER_CONFIG.DAILY_LIMIT} exceeded`);
    }
  }

  /**
   * Get wire transfer statistics
   */
  static async getWireTransferStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayTransfers, monthTransfers, totalTransfers] = await Promise.all([
      prisma.wireTransfer.findMany({
        where: {
          senderAccount: { userId },
          createdAt: { gte: today },
          transaction: { status: { in: ['PENDING', 'COMPLETED'] } },
        },
        include: { transaction: { select: { amount: true } } },
      }),
      prisma.wireTransfer.findMany({
        where: {
          senderAccount: { userId },
          createdAt: { gte: thisMonth },
          transaction: { status: { in: ['PENDING', 'COMPLETED'] } },
        },
        include: { transaction: { select: { amount: true } } },
      }),
      prisma.wireTransfer.count({
        where: {
          senderAccount: { userId },
          transaction: { status: 'COMPLETED' },
        },
      }),
    ]);

    const todayAmount = todayTransfers.reduce(
      (sum: number, transfer: any) => sum + Number(transfer.transaction.amount),
      0
    );

    const monthAmount = monthTransfers.reduce(
      (sum: number, transfer: any) => sum + Number(transfer.transaction.amount),
      0
    );

    return {
      today: {
        count: todayTransfers.length,
        amount: todayAmount,
        remainingLimit: Math.max(0, WIRE_TRANSFER_CONFIG.DAILY_LIMIT - todayAmount),
      },
      thisMonth: {
        count: monthTransfers.length,
        amount: monthAmount,
      },
      total: {
        count: totalTransfers,
      },
    };
  }
}
