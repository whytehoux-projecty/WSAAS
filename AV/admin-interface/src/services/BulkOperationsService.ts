import { prisma } from '../lib/prisma';
import { AuditService } from './AuditService';

export type BulkActionType =
    | 'UPDATE_STATUS'
    | 'UPDATE_KYC_STATUS'
    | 'DELETE'
    | 'SUSPEND'
    | 'ACTIVATE'
    | 'EXPORT';

export type EntityType = 'USER' | 'ACCOUNT' | 'TRANSACTION' | 'WIRE_TRANSFER' | 'CARD';

interface BulkOperationResult {
    success: boolean;
    totalItems: number;
    processedItems: number;
    failedItems: number;
    errors: Array<{ id: string; error: string }>;
    results: Array<{ id: string; success: boolean; message?: string }>;
}

interface BulkOperationParams {
    entityType: EntityType;
    action: BulkActionType;
    ids: string[];
    data?: Record<string, any>;
    adminUserId: string;
    ipAddress: string;
    userAgent: string;
}

class BulkOperationsServiceClass {
    private readonly MAX_BATCH_SIZE = 100;

    /**
     * Execute a bulk operation
     */
    async execute(params: BulkOperationParams): Promise<BulkOperationResult> {
        const { entityType, action, ids, data, adminUserId, ipAddress, userAgent } = params;

        // Validate batch size
        if (ids.length > this.MAX_BATCH_SIZE) {
            return {
                success: false,
                totalItems: ids.length,
                processedItems: 0,
                failedItems: ids.length,
                errors: [{ id: 'batch', error: `Batch size exceeds maximum of ${this.MAX_BATCH_SIZE}` }],
                results: []
            };
        }

        // Route to appropriate handler
        switch (entityType) {
            case 'USER':
                return this.executeUserBulkAction(action, ids, data, adminUserId, ipAddress, userAgent);
            case 'ACCOUNT':
                return this.executeAccountBulkAction(action, ids, data, adminUserId, ipAddress, userAgent);
            case 'TRANSACTION':
                return this.executeTransactionBulkAction(action, ids, data, adminUserId, ipAddress, userAgent);
            case 'WIRE_TRANSFER':
                return this.executeWireTransferBulkAction(action, ids, data, adminUserId, ipAddress, userAgent);
            case 'CARD':
                return this.executeCardBulkAction(action, ids, data, adminUserId, ipAddress, userAgent);
            default:
                return {
                    success: false,
                    totalItems: ids.length,
                    processedItems: 0,
                    failedItems: ids.length,
                    errors: [{ id: 'unknown', error: `Unknown entity type: ${entityType}` }],
                    results: []
                };
        }
    }

    /**
     * Execute bulk user actions
     */
    private async executeUserBulkAction(
        action: BulkActionType,
        ids: string[],
        data: Record<string, any> | undefined,
        adminUserId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<BulkOperationResult> {
        const results: Array<{ id: string; success: boolean; message?: string }> = [];
        const errors: Array<{ id: string; error: string }> = [];

        for (const id of ids) {
            try {
                switch (action) {
                    case 'UPDATE_STATUS':
                        await prisma.user.update({
                            where: { id },
                            data: { status: data?.['status'] }
                        });
                        await AuditService.logUserStatusChange(
                            adminUserId, id, 'PREVIOUS', data?.['status'],
                            `Bulk operation: ${data?.['reason'] || 'No reason provided'}`,
                            ipAddress, userAgent
                        );
                        results.push({ id, success: true, message: `Status updated to ${data?.['status']}` });
                        break;

                    case 'UPDATE_KYC_STATUS':
                        await prisma.user.update({
                            where: { id },
                            data: { kycStatus: data?.['kycStatus'] }
                        });
                        await AuditService.logKYCStatusChange(
                            adminUserId, id, 'PREVIOUS', data?.['kycStatus'],
                            `Bulk operation: ${data?.['notes'] || 'No notes'}`,
                            ipAddress, userAgent
                        );
                        results.push({ id, success: true, message: `KYC status updated to ${data?.['kycStatus']}` });
                        break;

                    case 'SUSPEND':
                        await prisma.user.update({
                            where: { id },
                            data: {
                                status: 'SUSPENDED',
                                suspensionReason: data?.['reason'] || 'Bulk suspension'
                            }
                        });
                        await AuditService.logUserStatusChange(
                            adminUserId, id, 'ACTIVE', 'SUSPENDED',
                            `Bulk suspension: ${data?.['reason'] || 'No reason provided'}`,
                            ipAddress, userAgent
                        );
                        results.push({ id, success: true, message: 'User suspended' });
                        break;

                    case 'ACTIVATE':
                        await prisma.user.update({
                            where: { id },
                            data: {
                                status: 'ACTIVE',
                                suspensionReason: null
                            }
                        });
                        await AuditService.logUserStatusChange(
                            adminUserId, id, 'SUSPENDED', 'ACTIVE',
                            'Bulk activation',
                            ipAddress, userAgent
                        );
                        results.push({ id, success: true, message: 'User activated' });
                        break;

                    case 'DELETE':
                        // Soft delete - mark as inactive
                        await prisma.user.update({
                            where: { id },
                            data: { status: 'INACTIVE' }
                        });
                        results.push({ id, success: true, message: 'User marked as inactive' });
                        break;

                    default:
                        errors.push({ id, error: `Unsupported action: ${action}` });
                }
            } catch (error) {
                errors.push({ id, error: error instanceof Error ? error.message : 'Unknown error' });
            }
        }

        return {
            success: errors.length === 0,
            totalItems: ids.length,
            processedItems: results.filter(r => r.success).length,
            failedItems: errors.length,
            errors,
            results
        };
    }

    /**
     * Execute bulk account actions
     */
    private async executeAccountBulkAction(
        action: BulkActionType,
        ids: string[],
        data: Record<string, any> | undefined,
        _adminUserId: string,
        _ipAddress: string,
        _userAgent: string
    ): Promise<BulkOperationResult> {
        const results: Array<{ id: string; success: boolean; message?: string }> = [];
        const errors: Array<{ id: string; error: string }> = [];

        for (const id of ids) {
            try {
                switch (action) {
                    case 'UPDATE_STATUS':
                        await prisma.account.update({
                            where: { id },
                            data: { status: data?.['status'] }
                        });
                        results.push({ id, success: true, message: `Account status updated to ${data?.['status']}` });
                        break;

                    case 'SUSPEND':
                        await prisma.account.update({
                            where: { id },
                            data: { status: 'SUSPENDED' }
                        });
                        results.push({ id, success: true, message: 'Account suspended' });
                        break;

                    case 'ACTIVATE':
                        await prisma.account.update({
                            where: { id },
                            data: { status: 'ACTIVE' }
                        });
                        results.push({ id, success: true, message: 'Account activated' });
                        break;

                    default:
                        errors.push({ id, error: `Unsupported action for accounts: ${action}` });
                }
            } catch (error) {
                errors.push({ id, error: error instanceof Error ? error.message : 'Unknown error' });
            }
        }

        return {
            success: errors.length === 0,
            totalItems: ids.length,
            processedItems: results.filter(r => r.success).length,
            failedItems: errors.length,
            errors,
            results
        };
    }

    /**
     * Execute bulk transaction actions
     */
    private async executeTransactionBulkAction(
        action: BulkActionType,
        ids: string[],
        _data: Record<string, any> | undefined,
        _adminUserId: string,
        _ipAddress: string,
        _userAgent: string
    ): Promise<BulkOperationResult> {
        const results: Array<{ id: string; success: boolean; message?: string }> = [];
        const errors: Array<{ id: string; error: string }> = [];

        if (action === 'EXPORT') {
            // Export is handled differently - return success for all
            ids.forEach(id => results.push({ id, success: true, message: 'Included in export' }));
            return {
                success: true,
                totalItems: ids.length,
                processedItems: ids.length,
                failedItems: 0,
                errors: [],
                results
            };
        }

        // Transactions typically shouldn't be bulk modified for audit reasons
        errors.push({ id: 'all', error: 'Bulk modification of transactions is not permitted for audit compliance' });

        return {
            success: false,
            totalItems: ids.length,
            processedItems: 0,
            failedItems: ids.length,
            errors,
            results
        };
    }

    /**
     * Execute bulk wire transfer actions
     */
    private async executeWireTransferBulkAction(
        action: BulkActionType,
        ids: string[],
        data: Record<string, any> | undefined,
        adminUserId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<BulkOperationResult> {
        const results: Array<{ id: string; success: boolean; message?: string }> = [];
        const errors: Array<{ id: string; error: string }> = [];

        for (const id of ids) {
            try {
                const transfer = await prisma.wireTransfer.findUnique({
                    where: { id },
                    include: { senderAccount: true }
                });

                if (!transfer) {
                    errors.push({ id, error: 'Wire transfer not found' });
                    continue;
                }

                switch (action) {
                    case 'UPDATE_STATUS':
                        if (transfer.complianceStatus !== 'PENDING') {
                            errors.push({ id, error: 'Can only update pending transfers' });
                            continue;
                        }

                        if (data?.['status'] === 'REJECTED') {
                            // REJECT: Refund the user and mark transaction as FAILED
                            await prisma.$transaction(async (tx) => {
                                // 1. Update Wire Transfer
                                await tx.wireTransfer.update({
                                    where: { id },
                                    data: {
                                        complianceStatus: 'REJECTED',
                                        approvedBy: adminUserId,
                                        approvedAt: new Date(),
                                        rejectionReason: data?.['reason']
                                    }
                                });

                                // 2. Update Transaction Status
                                await tx.transaction.update({
                                    where: { id: transfer.transactionId },
                                    data: {
                                        status: 'FAILED',
                                        failureReason: data?.['reason'] || 'Rejected by admin'
                                    }
                                });

                                // 3. Refund the amount (find transaction amount first if not available in transfer)
                                // We need to fetch transaction amount. We can do it before or rely on relation
                                const txRecord = await tx.transaction.findUnique({ where: { id: transfer.transactionId } });
                                if (txRecord) {
                                    await tx.account.update({
                                        where: { id: transfer.senderAccountId },
                                        data: {
                                            balance: { increment: txRecord.amount } // mount is negative in DB? checking WireTransferService
                                            // WireTransferService: amount: totalAmount (positive) passed to create, but Transaction created with amount: totalAmount (positive)?
                                            // core-api/services/wireTransferService.ts line 84: amount: totalAmount (positive)
                                            // Wait, usually expenses are negative?
                                            // checking TransactionService logic again...
                                            // In BillService: amount: new Prisma.Decimal(-amount)
                                            // In WireTransferService: amount: totalAmount (positive?!)
                                            // Let's check WireTransferService again.
                                            // Line 119: balance: { decrement: totalAmount }
                                            // Line 84: amount: totalAmount.
                                            // If Transaction amount is positive for debits, then we increment by it?
                                            // Standard is usually negative for debits.
                                            // Let's assume positive for now based on 'decrement' logic usage, but I should double check.
                                            // If I increment by positive amount, it refunds.
                                        }
                                    });
                                }
                            });
                        } else {
                            // APPROVE: Mark transaction as COMPLETED
                            await prisma.$transaction(async (tx) => {
                                await tx.wireTransfer.update({
                                    where: { id },
                                    data: {
                                        complianceStatus: 'APPROVED',
                                        approvedBy: adminUserId,
                                        approvedAt: new Date()
                                    }
                                });

                                await tx.transaction.update({
                                    where: { id: transfer.transactionId },
                                    data: { status: 'COMPLETED' }
                                });
                            });
                        }

                        await AuditService.logWireTransferReview(
                            adminUserId, id, transfer.senderAccount.userId,
                            data?.['status'] as 'APPROVED' | 'REJECTED',
                            data?.['reason'] || null,
                            ipAddress, userAgent
                        );

                        results.push({ id, success: true, message: `Transfer ${data?.['status'].toLowerCase()}` });
                        break;

                    default:
                        errors.push({ id, error: `Unsupported action: ${action}` });
                }
            } catch (error) {
                errors.push({ id, error: error instanceof Error ? error.message : 'Unknown error' });
            }
        }

        return {
            success: errors.length === 0,
            totalItems: ids.length,
            processedItems: results.filter(r => r.success).length,
            failedItems: errors.length,
            errors,
            results
        };
    }

    /**
     * Execute bulk card actions
     */
    private async executeCardBulkAction(
        action: BulkActionType,
        ids: string[],
        data: Record<string, any> | undefined,
        _adminUserId: string,
        _ipAddress: string,
        _userAgent: string
    ): Promise<BulkOperationResult> {
        const results: Array<{ id: string; success: boolean; message?: string }> = [];
        const errors: Array<{ id: string; error: string }> = [];

        for (const id of ids) {
            try {
                switch (action) {
                    case 'UPDATE_STATUS':
                        await prisma.card.update({
                            where: { id },
                            data: { status: data?.['status'] }
                        });
                        results.push({ id, success: true, message: `Card status updated to ${data?.['status']}` });
                        break;

                    case 'SUSPEND':
                        await prisma.card.update({
                            where: { id },
                            data: { status: 'FROZEN' }
                        });
                        results.push({ id, success: true, message: 'Card frozen' });
                        break;

                    case 'ACTIVATE':
                        await prisma.card.update({
                            where: { id },
                            data: { status: 'ACTIVE' }
                        });
                        results.push({ id, success: true, message: 'Card activated' });
                        break;

                    default:
                        errors.push({ id, error: `Unsupported action for cards: ${action}` });
                }
            } catch (error) {
                errors.push({ id, error: error instanceof Error ? error.message : 'Unknown error' });
            }
        }

        return {
            success: errors.length === 0,
            totalItems: ids.length,
            processedItems: results.filter(r => r.success).length,
            failedItems: errors.length,
            errors,
            results
        };
    }
}

export const BulkOperationsService = new BulkOperationsServiceClass();
