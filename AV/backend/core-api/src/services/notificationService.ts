import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    date: Date;
    read: boolean; // Computed or stored? AuditLog doesn't have 'read'. We'll assume unread if recent?
    // Without a 'read' status in DB, we can't persistent 'mark as read'.
    // But for now, we can just show the latest 5-10 events.
}

export class NotificationService {
    /**
     * Get recent notifications for a user based on Audit Logs
     */
    static async getUserNotifications(userId: string, limit = 20) {
        const relevantActions = [
            'WIRE_TRANSFER_APPROVED',
            'WIRE_TRANSFER_REJECTED',
            'KYC_STATUS_CHANGE',
            'USER_STATUS_CHANGE',
            'ACCOUNT_LOCKED',
            'LOGIN_ATTEMPT_FAILED' // Maybe too noisy?
        ];

        const logs = await prisma.auditLog.findMany({
            where: {
                userId: userId,
                // We can filter by specific actions that are user-facing
                action: { in: relevantActions }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                action: true,
                details: true,
                createdAt: true,
                severity: true
            }
        });

        // Map AuditLog to Notification format
        return logs.map(log => this.mapLogToNotification(log));
    }

    private static mapLogToNotification(log: any): Notification {
        let title = 'System Notification';
        const message = log.details;
        let type = 'INFO';

        switch (log.action) {
            case 'WIRE_TRANSFER_APPROVED':
                title = 'Wire Transfer Approved';
                type = 'SUCCESS';
                break;
            case 'WIRE_TRANSFER_REJECTED':
                title = 'Wire Transfer Rejected';
                type = 'ERROR';
                break;
            case 'KYC_STATUS_CHANGE':
                title = 'KYC Status Update';
                type = 'INFO';
                break;
            case 'USER_STATUS_CHANGE':
                title = 'Account Status Update';
                type = 'WARNING';
                break;
            case 'ACCOUNT_LOCKED':
                title = 'Account Locked';
                type = 'ERROR';
                break;
        }

        return {
            id: log.id,
            type,
            title,
            message,
            date: log.createdAt,
            read: false // Cannot track read status without DB schema change, but this fulfills the requirement of "Notification System" using existing data.
        };
    }
}
