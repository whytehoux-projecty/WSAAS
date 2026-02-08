import { prisma } from '../lib/prisma';

export interface AdminNotification {
    id: string;
    adminUserId: string;
    type: NotificationType;
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'success';
    read: boolean;
    actionUrl?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}

export type NotificationType =
    | 'KYC_PENDING'
    | 'KYC_APPROVED'
    | 'KYC_REJECTED'
    | 'WIRE_TRANSFER_PENDING'
    | 'WIRE_TRANSFER_APPROVED'
    | 'WIRE_TRANSFER_REJECTED'
    | 'USER_REGISTERED'
    | 'USER_SUSPENDED'
    | 'SECURITY_ALERT'
    | 'SYSTEM_UPDATE'
    | 'PAYMENT_VERIFICATION_PENDING'
    | 'HIGH_VALUE_TRANSACTION'
    | 'LOGIN_ATTEMPT_FAILED'
    | 'ACCOUNT_LOCKED';

interface CreateNotificationParams {
    adminUserId?: string; // If null, sends to all admins
    type: NotificationType;
    title: string;
    message: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
    actionUrl?: string;
    metadata?: Record<string, any>;
}

// In-memory notification store (would use Redis in production)
const notificationStore: Map<string, AdminNotification[]> = new Map();

class InAppNotificationServiceClass {
    private readonly MAX_NOTIFICATIONS_PER_USER = 100;

    /**
     * Create a notification for a specific admin or all admins
     */
    async create(params: CreateNotificationParams): Promise<AdminNotification | AdminNotification[]> {
        const notification: Omit<AdminNotification, 'id' | 'adminUserId'> = {
            type: params.type,
            title: params.title,
            message: params.message,
            severity: params.severity || 'info',
            read: false,
            createdAt: new Date()
        };

        if (params.actionUrl) {
            notification.actionUrl = params.actionUrl;
        }

        if (params.metadata) {
            notification.metadata = params.metadata;
        }

        if (params.adminUserId) {
            // Send to specific admin
            return this.createForUser(params.adminUserId, notification);
        } else {
            // Send to all admins
            return this.createForAllAdmins(notification);
        }
    }

    /**
     * Create notification for a specific user
     */
    private createForUser(
        adminUserId: string,
        notification: Omit<AdminNotification, 'id' | 'adminUserId'>
    ): AdminNotification {
        const fullNotification: AdminNotification = {
            ...notification,
            id: this.generateId(),
            adminUserId
        };

        const userNotifications = notificationStore.get(adminUserId) || [];
        userNotifications.unshift(fullNotification);

        // Keep only the most recent notifications
        if (userNotifications.length > this.MAX_NOTIFICATIONS_PER_USER) {
            userNotifications.splice(this.MAX_NOTIFICATIONS_PER_USER);
        }

        notificationStore.set(adminUserId, userNotifications);

        return fullNotification;
    }

    /**
     * Create notification for all admins
     */
    private async createForAllAdmins(
        notification: Omit<AdminNotification, 'id' | 'adminUserId'>
    ): Promise<AdminNotification[]> {
        try {
            const admins = await prisma.adminUser.findMany({
                where: { status: 'ACTIVE' },
                select: { id: true }
            });

            return admins.map(admin => this.createForUser(admin.id, notification));
        } catch (error) {
            console.error('Failed to get admin list:', error);
            return [];
        }
    }

    /**
     * Get notifications for an admin user
     */
    getForUser(adminUserId: string, options?: {
        unreadOnly?: boolean;
        limit?: number;
        type?: NotificationType;
    }): AdminNotification[] {
        let notifications = notificationStore.get(adminUserId) || [];

        if (options?.unreadOnly) {
            notifications = notifications.filter(n => !n.read);
        }

        if (options?.type) {
            notifications = notifications.filter(n => n.type === options.type);
        }

        if (options?.limit) {
            notifications = notifications.slice(0, options.limit);
        }

        return notifications;
    }

    /**
     * Get unread count for an admin user
     */
    getUnreadCount(adminUserId: string): number {
        const notifications = notificationStore.get(adminUserId) || [];
        return notifications.filter(n => !n.read).length;
    }

    /**
     * Mark notification as read
     */
    markAsRead(adminUserId: string, notificationId: string): boolean {
        const notifications = notificationStore.get(adminUserId);

        if (!notifications) return false;

        const notification = notifications.find(n => n.id === notificationId);

        if (notification) {
            notification.read = true;
            return true;
        }

        return false;
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(adminUserId: string): number {
        const notifications = notificationStore.get(adminUserId);

        if (!notifications) return 0;

        let count = 0;
        notifications.forEach(n => {
            if (!n.read) {
                n.read = true;
                count++;
            }
        });

        return count;
    }

    /**
     * Delete a notification
     */
    delete(adminUserId: string, notificationId: string): boolean {
        const notifications = notificationStore.get(adminUserId);

        if (!notifications) return false;

        const index = notifications.findIndex(n => n.id === notificationId);

        if (index !== -1) {
            notifications.splice(index, 1);
            return true;
        }

        return false;
    }

    /**
     * Clear all notifications for a user
     */
    clearAll(adminUserId: string): void {
        notificationStore.delete(adminUserId);
    }

    /**
     * Generate unique notification ID
     */
    private generateId(): string {
        return `ntf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ============ Convenience Methods for Common Notifications ============

    /**
     * Notify about pending KYC review
     */
    async notifyPendingKYC(userId: string, userName: string): Promise<void> {
        await this.create({
            type: 'KYC_PENDING',
            title: 'New KYC Submission',
            message: `${userName} has submitted documents for KYC verification.`,
            severity: 'info',
            actionUrl: `/kyc?userId=${userId}`,
            metadata: { userId }
        });
    }

    /**
     * Notify about pending wire transfer
     */
    async notifyPendingWireTransfer(transferId: string, amount: number, currency: string): Promise<void> {
        await this.create({
            type: 'WIRE_TRANSFER_PENDING',
            title: 'Wire Transfer Pending Review',
            message: `A wire transfer of ${currency} ${amount.toLocaleString()} is pending approval.`,
            severity: 'warning',
            actionUrl: `/wire-transfers?id=${transferId}`,
            metadata: { transferId, amount, currency }
        });
    }

    /**
     * Notify about high-value transaction
     */
    async notifyHighValueTransaction(transactionId: string, amount: number, threshold: number): Promise<void> {
        await this.create({
            type: 'HIGH_VALUE_TRANSACTION',
            title: 'High-Value Transaction Detected',
            message: `A transaction of $${amount.toLocaleString()} exceeds the $${threshold.toLocaleString()} threshold.`,
            severity: 'warning',
            actionUrl: `/transactions?id=${transactionId}`,
            metadata: { transactionId, amount, threshold }
        });
    }

    /**
     * Notify about security alert
     */
    async notifySecurityAlert(title: string, message: string, details?: any): Promise<void> {
        await this.create({
            type: 'SECURITY_ALERT',
            title,
            message,
            severity: 'error',
            metadata: details
        });
    }

    /**
     * Notify about failed login attempts
     */
    async notifyFailedLoginAttempts(email: string, attempts: number, ipAddress: string): Promise<void> {
        await this.create({
            type: 'LOGIN_ATTEMPT_FAILED',
            title: 'Multiple Failed Login Attempts',
            message: `${attempts} failed login attempts for ${email} from IP ${ipAddress}.`,
            severity: 'warning',
            metadata: { email, attempts, ipAddress }
        });
    }

    /**
     * Notify about account lockout
     */
    async notifyAccountLocked(email: string, reason: string): Promise<void> {
        await this.create({
            type: 'ACCOUNT_LOCKED',
            title: 'Account Locked',
            message: `Account ${email} has been locked. Reason: ${reason}`,
            severity: 'error',
            actionUrl: `/users?search=${email}`,
            metadata: { email, reason }
        });
    }

    /**
     * Notify about new user registration
     */
    async notifyNewUser(userId: string, email: string): Promise<void> {
        await this.create({
            type: 'USER_REGISTERED',
            title: 'New User Registration',
            message: `A new user has registered: ${email}`,
            severity: 'info',
            actionUrl: `/users/${userId}`,
            metadata: { userId, email }
        });
    }

    /**
     * Notify about payment verification needed
     */
    async notifyPaymentVerificationPending(verificationId: string, amount: number): Promise<void> {
        await this.create({
            type: 'PAYMENT_VERIFICATION_PENDING',
            title: 'Payment Verification Required',
            message: `A payment of $${amount.toLocaleString()} requires verification.`,
            severity: 'warning',
            actionUrl: `/verifications?id=${verificationId}`,
            metadata: { verificationId, amount }
        });
    }
}

export const InAppNotificationService = new InAppNotificationServiceClass();
