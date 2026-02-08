import { BillService } from '../../src/services/bill.service';
import { WebhookService } from '../../src/services/webhook.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Prisma
const mockPrisma: any = {
  systemConfig: { findUnique: jest.fn() },
  account: { findFirst: jest.fn(), update: jest.fn() },
  billPayee: { findFirst: jest.fn() },
  transaction: { create: jest.fn() },
  paymentVerification: { create: jest.fn() },
  $transaction: jest.fn((cb: any) => cb(mockPrisma)),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: { Decimal: jest.fn(val => ({ lt: jest.fn(), val })) },
}));

jest.mock('../../src/services/webhook.service');

describe('BillService', () => {
  let service: BillService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BillService();
  });

  describe('getVerificationThreshold', () => {
    it('should return configured threshold', async () => {
      mockPrisma.systemConfig.findUnique.mockResolvedValue({ value: '5000' });
      const threshold = await service.getVerificationThreshold();
      expect(threshold).toBe(5000);
    });

    it('should return default 10000 if config missing', async () => {
      mockPrisma.systemConfig.findUnique.mockResolvedValue(null);
      const threshold = await service.getVerificationThreshold();
      expect(threshold).toBe(10000);
    });
  });

  describe('processPayment', () => {
    const validParams = {
      userId: 'user1',
      payeeId: 'payee1',
      amount: 100,
      accountId: 'acc1',
      reference: 'INV-123',
    };

    it('should require verification if amount exceeds threshold', async () => {
      mockPrisma.systemConfig.findUnique.mockResolvedValue({ value: '50' });
      const result = await service.processPayment(validParams);
      expect(result.requiresVerification).toBe(true);
      expect(result.success).toBe(false);
    });

    it('should fail if account not found', async () => {
      mockPrisma.systemConfig.findUnique.mockResolvedValue({ value: '1000' });
      mockPrisma.account.findFirst.mockResolvedValue(null);
      const result = await service.processPayment(validParams);
      expect(result.error).toBe('Account not found');
    });

    it('should fail if insufficient funds', async () => {
      mockPrisma.systemConfig.findUnique.mockResolvedValue({ value: '1000' });
      mockPrisma.account.findFirst.mockResolvedValue({
        balance: { lt: jest.fn().mockReturnValue(true) },
        currency: 'USD',
      });
      const result = await service.processPayment(validParams);
      expect(result.error).toBe('Insufficient funds');
    });

    it('should fail if payee not found', async () => {
      mockPrisma.systemConfig.findUnique.mockResolvedValue({ value: '1000' });
      mockPrisma.account.findFirst.mockResolvedValue({
        balance: { lt: jest.fn().mockReturnValue(false) },
        currency: 'USD',
      });
      mockPrisma.billPayee.findFirst.mockResolvedValue(null);
      const result = await service.processPayment(validParams);
      expect(result.error).toBe('Payee not found');
    });

    it('should process payment and send webhook if reference matches INV-', async () => {
      mockPrisma.systemConfig.findUnique.mockResolvedValue({ value: '1000' });
      mockPrisma.account.findFirst.mockResolvedValue({
        balance: { lt: jest.fn().mockReturnValue(false) },
        currency: 'USD',
      });
      mockPrisma.billPayee.findFirst.mockResolvedValue({ category: 'UTILITIES', name: 'Power Co' });
      mockPrisma.transaction.create.mockResolvedValue({ id: 'tx-123' });

      const result = await service.processPayment(validParams);

      expect(result.success).toBe(true);
      expect(mockPrisma.transaction.create).toHaveBeenCalled();
      // Verify webhook called
      const webhookInstance = (WebhookService as any).mock.instances[0];
      expect(webhookInstance.sendPaymentNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceNumber: 'INV-123',
          amount: 100,
          transactionRef: 'tx-123',
        })
      );
    });

    it('should NOT send webhook if reference does not start with INV-', async () => {
      mockPrisma.systemConfig.findUnique.mockResolvedValue({ value: '1000' });
      mockPrisma.account.findFirst.mockResolvedValue({
        balance: { lt: jest.fn().mockReturnValue(false) },
        currency: 'USD',
      });
      mockPrisma.billPayee.findFirst.mockResolvedValue({ category: 'UTILITIES', name: 'Power Co' });
      mockPrisma.transaction.create.mockResolvedValue({ id: 'tx-123' });

      const result = await service.processPayment({ ...validParams, reference: 'OTHER-123' });

      expect(result.success).toBe(true);
      const webhookInstance = (WebhookService as any).mock.instances[0];
      expect(webhookInstance.sendPaymentNotification).not.toHaveBeenCalled();
    });
  });

  describe('processVerifiedPayment', () => {
    const validParams = {
      userId: 'user1',
      payeeId: 'payee1',
      amount: 50000,
      accountId: 'acc1',
      documentPath: '/tmp/doc.pdf',
    };

    it('should fail if amount is non-positive', async () => {
      const result = await service.processVerifiedPayment({ ...validParams, amount: 0 });
      expect(result.error).toBe('Invalid amount');
    });

    it('should fail if account not found', async () => {
      mockPrisma.account.findFirst.mockResolvedValue(null);
      const result = await service.processVerifiedPayment(validParams);
      expect(result.error).toBe('Account not found');
    });

    it('should fail if insufficient funds', async () => {
      mockPrisma.account.findFirst.mockResolvedValue({
        balance: { lt: jest.fn().mockReturnValue(true) },
        currency: 'USD',
      });
      const result = await service.processVerifiedPayment(validParams);
      expect(result.error).toBe('Insufficient funds');
    });

    it('should fail if payee not found', async () => {
      mockPrisma.account.findFirst.mockResolvedValue({
        balance: { lt: jest.fn().mockReturnValue(false) },
        currency: 'USD',
      });
      mockPrisma.billPayee.findFirst.mockResolvedValue(null);
      const result = await service.processVerifiedPayment(validParams);
      expect(result.error).toBe('Payee not found');
    });

    it('should process verified payment', async () => {
      mockPrisma.account.findFirst.mockResolvedValue({
        balance: { lt: jest.fn().mockReturnValue(false) },
        currency: 'USD',
      });
      mockPrisma.billPayee.findFirst.mockResolvedValue({ category: 'UTILITIES', name: 'Power Co' });
      mockPrisma.transaction.create.mockResolvedValue({ id: 'tx-verify-123' });
      mockPrisma.paymentVerification.create.mockResolvedValue({ id: 'pv-123' });

      const result = await service.processVerifiedPayment(validParams);

      expect(result.success).toBe(true);
      expect(mockPrisma.paymentVerification.create).toHaveBeenCalled();
      expect(result.message).toContain('Payment submitted for verification');
    });
  });
});
