import { prisma } from '../lib/prisma';
import { format, formatDistanceToNow } from 'date-fns';

export interface TimelineEvent {
    id: string;
    type: TimelineEventType;
    title: string;
    description: string;
    icon: string;
    iconColor: string;
    timestamp: Date;
    relativeTime: string;
    formattedTime: string;
    actor?: {
        id: string;
        name: string;
        email: string;
        type: 'admin' | 'user' | 'system';
    };
    target?: {
        id: string;
        type: string;
        name?: string;
    };
    metadata?: Record<string, any>;
}

export type TimelineEventType =
    | 'USER_REGISTERED'
    | 'USER_VERIFIED'
    | 'USER_SUSPENDED'
    | 'USER_ACTIVATED'
    | 'ACCOUNT_CREATED'
    | 'ACCOUNT_CLOSED'
    | 'TRANSACTION_COMPLETED'
    | 'TRANSACTION_FAILED'
    | 'WIRE_TRANSFER_INITIATED'
    | 'WIRE_TRANSFER_APPROVED'
    | 'WIRE_TRANSFER_REJECTED'
    | 'KYC_SUBMITTED'
    | 'KYC_APPROVED'
    | 'KYC_REJECTED'
    | 'CARD_ISSUED'
    | 'CARD_BLOCKED'
    | 'ADMIN_LOGIN'
    | 'ADMIN_ACTION'
    | 'SYSTEM_EVENT'
    | 'SECURITY_ALERT';

interface TimelineFilters {
    startDate?: Date;
    endDate?: Date;
    types?: TimelineEventType[];
    userId?: string;
    adminUserId?: string;
    limit?: number;
}

class ActivityTimelineServiceClass {
    private readonly DEFAULT_LIMIT = 50;

    /**
     * Get comprehensive activity timeline
     */
    async getTimeline(filters: TimelineFilters = {}): Promise<TimelineEvent[]> {
        const limit = filters.limit || this.DEFAULT_LIMIT;
        const events: TimelineEvent[] = [];

        // Fetch data from multiple sources in parallel
        const [auditLogs, recentUsers, recentTransactions, recentWireTransfers] = await Promise.all([
            this.fetchAuditLogs(filters, Math.floor(limit / 2)),
            this.fetchRecentUsers(filters, Math.floor(limit / 4)),
            this.fetchRecentTransactions(filters, Math.floor(limit / 4)),
            this.fetchRecentWireTransfers(filters, Math.floor(limit / 4))
        ]);

        // Convert to timeline events
        events.push(...auditLogs);
        events.push(...recentUsers);
        events.push(...recentTransactions);
        events.push(...recentWireTransfers);

        // Sort by timestamp descending and limit
        return events
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }

    /**
     * Get timeline for a specific user
     */
    async getUserTimeline(userId: string, limit: number = 20): Promise<TimelineEvent[]> {
        return this.getTimeline({ userId, limit });
    }

    /**
     * Get timeline for a specific admin
     */
    async getAdminTimeline(adminUserId: string, limit: number = 20): Promise<TimelineEvent[]> {
        return this.getTimeline({ adminUserId, limit });
    }

    /**
     * Get today's activity summary
     */
    async getTodaySummary(): Promise<{
        totalEvents: number;
        eventsByType: Record<string, number>;
        recentEvents: TimelineEvent[];
    }> {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const events = await this.getTimeline({
            startDate: startOfToday,
            limit: 100
        });

        const eventsByType: Record<string, number> = {};
        events.forEach(event => {
            eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
        });

        return {
            totalEvents: events.length,
            eventsByType,
            recentEvents: events.slice(0, 10)
        };
    }

    // ============ Data Fetchers ============

    private async fetchAuditLogs(filters: TimelineFilters, limit: number): Promise<TimelineEvent[]> {
        const where: any = {};

        if (filters.startDate) {
            where.createdAt = { gte: filters.startDate };
        }
        if (filters.endDate) {
            where.createdAt = { ...where.createdAt, lte: filters.endDate };
        }
        if (filters.userId) {
            where.userId = filters.userId;
        }
        if (filters.adminUserId) {
            where.adminUserId = filters.adminUserId;
        }

        const logs = await prisma.auditLog.findMany({
            where,
            include: {
                adminUser: { select: { id: true, email: true, firstName: true, lastName: true } },
                user: { select: { id: true, email: true, firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return logs.map(log => this.auditLogToEvent(log));
    }

    private async fetchRecentUsers(filters: TimelineFilters, limit: number): Promise<TimelineEvent[]> {
        const where: any = {};

        if (filters.startDate) {
            where.createdAt = { gte: filters.startDate };
        }
        if (filters.userId) {
            where.id = filters.userId;
        }

        const users = await prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return users.map(user => ({
            id: `user_${user.id}`,
            type: 'USER_REGISTERED' as TimelineEventType,
            title: 'New User Registration',
            description: `${user.firstName} ${user.lastName} (${user.email}) registered`,
            icon: 'user-plus',
            iconColor: 'emerald',
            timestamp: user.createdAt,
            relativeTime: formatDistanceToNow(user.createdAt, { addSuffix: true }),
            formattedTime: format(user.createdAt, 'PPpp'),
            target: {
                id: user.id,
                type: 'USER',
                name: `${user.firstName} ${user.lastName}`
            }
        }));
    }

    private async fetchRecentTransactions(filters: TimelineFilters, limit: number): Promise<TimelineEvent[]> {
        const where: any = {};

        if (filters.startDate) {
            where.createdAt = { gte: filters.startDate };
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                account: {
                    include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return transactions.map(txn => ({
            id: `txn_${txn.id}`,
            type: txn.status === 'COMPLETED' ? 'TRANSACTION_COMPLETED' : 'TRANSACTION_FAILED' as TimelineEventType,
            title: `${txn.type} ${txn.status === 'COMPLETED' ? 'Completed' : 'Failed'}`,
            description: `${txn.type} of ${txn.currency} ${Math.abs(Number(txn.amount)).toLocaleString()}`,
            icon: txn.type === 'DEPOSIT' ? 'arrow-down' : 'arrow-up',
            iconColor: txn.status === 'COMPLETED' ? 'emerald' : 'ruby',
            timestamp: txn.createdAt,
            relativeTime: formatDistanceToNow(txn.createdAt, { addSuffix: true }),
            formattedTime: format(txn.createdAt, 'PPpp'),
            target: {
                id: txn.id,
                type: 'TRANSACTION',
                name: txn.reference
            },
            metadata: {
                amount: Number(txn.amount),
                currency: txn.currency,
                reference: txn.reference
            }
        }));
    }

    private async fetchRecentWireTransfers(filters: TimelineFilters, limit: number): Promise<TimelineEvent[]> {
        const where: any = {};

        if (filters.startDate) {
            where.createdAt = { gte: filters.startDate };
        }

        const transfers = await prisma.wireTransfer.findMany({
            where,
            include: {
                transaction: true,
                senderAccount: {
                    include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return transfers.map(transfer => {
            let type: TimelineEventType = 'WIRE_TRANSFER_INITIATED';
            let title = 'Wire Transfer Initiated';
            let iconColor = 'amber';

            if (transfer.complianceStatus === 'APPROVED') {
                type = 'WIRE_TRANSFER_APPROVED';
                title = 'Wire Transfer Approved';
                iconColor = 'emerald';
            } else if (transfer.complianceStatus === 'REJECTED') {
                type = 'WIRE_TRANSFER_REJECTED';
                title = 'Wire Transfer Rejected';
                iconColor = 'ruby';
            }

            return {
                id: `wire_${transfer.id}`,
                type,
                title,
                description: `Transfer to ${transfer.recipientName} - ${transfer.transaction.currency} ${Math.abs(Number(transfer.transaction.amount)).toLocaleString()}`,
                icon: 'send',
                iconColor,
                timestamp: transfer.createdAt,
                relativeTime: formatDistanceToNow(transfer.createdAt, { addSuffix: true }),
                formattedTime: format(transfer.createdAt, 'PPpp'),
                actor: {
                    id: transfer.senderAccount.user.id,
                    name: `${transfer.senderAccount.user.firstName} ${transfer.senderAccount.user.lastName}`,
                    email: transfer.senderAccount.user.email,
                    type: 'user' as const
                },
                target: {
                    id: transfer.id,
                    type: 'WIRE_TRANSFER',
                    name: transfer.recipientName
                },
                metadata: {
                    recipientBank: transfer.recipientBankName,
                    amount: Number(transfer.transaction.amount),
                    status: transfer.complianceStatus
                }
            };
        });
    }

    // ============ Converters ============

    private auditLogToEvent(log: any): TimelineEvent {
        const eventTypeMap: Record<string, TimelineEventType> = {
            'ADMIN_LOGIN_SUCCESS': 'ADMIN_LOGIN',
            'ADMIN_LOGIN_FAILED': 'SECURITY_ALERT',
            'USER_STATUS_CHANGE': 'ADMIN_ACTION',
            'KYC_STATUS_CHANGE': 'ADMIN_ACTION',
            'WIRE_TRANSFER_APPROVED': 'WIRE_TRANSFER_APPROVED',
            'WIRE_TRANSFER_REJECTED': 'WIRE_TRANSFER_REJECTED'
        };

        const iconMap: Record<string, { icon: string; color: string }> = {
            'ADMIN_LOGIN': { icon: 'login', color: 'blue' },
            'SECURITY_ALERT': { icon: 'shield-exclamation', color: 'ruby' },
            'ADMIN_ACTION': { icon: 'cog', color: 'gray' },
            'WIRE_TRANSFER_APPROVED': { icon: 'check-circle', color: 'emerald' },
            'WIRE_TRANSFER_REJECTED': { icon: 'x-circle', color: 'ruby' }
        };

        const type = eventTypeMap[log.action] || 'SYSTEM_EVENT';
        const { icon, color } = iconMap[type] || { icon: 'info-circle', color: 'gray' };

        const event: TimelineEvent = {
            id: `audit_${log.id}`,
            type,
            title: this.formatActionTitle(log.action),
            description: log.details || log.action,
            icon,
            iconColor: color,
            timestamp: log.createdAt,
            relativeTime: formatDistanceToNow(log.createdAt, { addSuffix: true }),
            formattedTime: format(log.createdAt, 'PPpp'),
            metadata: {
                severity: log.severity,
                category: log.category,
                ipAddress: log.ipAddress
            }
        };

        if (log.adminUser) {
            event.actor = {
                id: log.adminUser.id,
                name: `${log.adminUser.firstName} ${log.adminUser.lastName}`,
                email: log.adminUser.email,
                type: 'admin' as const
            };
        }

        if (log.entityId) {
            event.target = {
                id: log.entityId,
                type: log.entityType
            };
        }

        return event;
    }

    private formatActionTitle(action: string): string {
        return action
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/^\w/, c => c.toUpperCase());
    }
}

export const ActivityTimelineService = new ActivityTimelineServiceClass();
