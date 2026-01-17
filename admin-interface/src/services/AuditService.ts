import { prisma } from '../lib/prisma';

interface AuditLogData {
  adminUserId?: string | null;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  category: string;
}

export class AuditService {
  /**
   * Log an audit event
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          adminUserId: data.adminUserId || null,
          userId: data.userId || null,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          details: data.details,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          severity: data.severity,
          category: data.category,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  /**
   * Log admin login
   */
  static async logAdminLogin(adminUserId: string, ipAddress: string, userAgent: string, success: boolean): Promise<void> {
    await this.log({
      adminUserId,
      action: success ? 'ADMIN_LOGIN_SUCCESS' : 'ADMIN_LOGIN_FAILED',
      entityType: 'ADMIN_USER',
      entityId: adminUserId,
      details: success ? 'Admin user logged in successfully' : 'Admin login attempt failed',
      ipAddress,
      userAgent,
      severity: success ? 'INFO' : 'WARNING',
      category: 'AUTH',
    });
  }

  /**
   * Log admin logout
   */
  static async logAdminLogout(adminUserId: string, ipAddress: string, userAgent: string): Promise<void> {
    await this.log({
      adminUserId,
      action: 'ADMIN_LOGOUT',
      entityType: 'ADMIN_USER',
      entityId: adminUserId,
      details: 'Admin user logged out',
      ipAddress,
      userAgent,
      severity: 'INFO',
      category: 'AUTH',
    });
  }

  /**
   * Log password change
   */
  static async logPasswordChange(adminUserId: string, ipAddress: string, userAgent: string): Promise<void> {
    await this.log({
      adminUserId,
      action: 'PASSWORD_CHANGE',
      entityType: 'ADMIN_USER',
      entityId: adminUserId,
      details: 'Admin password changed',
      ipAddress,
      userAgent,
      severity: 'INFO',
      category: 'SECURITY',
    });
  }

  /**
   * Log profile update
   */
  static async logProfileUpdate(adminUserId: string, ipAddress: string, userAgent: string, changes: string[]): Promise<void> {
    await this.log({
      adminUserId,
      action: 'PROFILE_UPDATE',
      entityType: 'ADMIN_USER',
      entityId: adminUserId,
      details: `Profile updated: ${changes.join(', ')}`,
      ipAddress,
      userAgent,
      severity: 'INFO',
      category: 'ADMIN',
    });
  }

  /**
   * Log user status change
   */
  static async logUserStatusChange(
    adminUserId: string,
    userId: string,
    oldStatus: string,
    newStatus: string,
    reason: string | null,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.log({
      adminUserId,
      userId,
      action: 'USER_STATUS_CHANGE',
      entityType: 'USER',
      entityId: userId,
      details: `User status changed from ${oldStatus} to ${newStatus}${reason ? `. Reason: ${reason}` : ''}`,
      ipAddress,
      userAgent,
      severity: newStatus === 'SUSPENDED' ? 'WARNING' : 'INFO',
      category: 'USER_MANAGEMENT',
    });
  }

  /**
   * Log KYC status change
   */
  static async logKYCStatusChange(
    adminUserId: string,
    userId: string,
    oldStatus: string,
    newStatus: string,
    notes: string | null,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.log({
      adminUserId,
      userId,
      action: 'KYC_STATUS_CHANGE',
      entityType: 'USER',
      entityId: userId,
      details: `KYC status changed from ${oldStatus} to ${newStatus}${notes ? `. Notes: ${notes}` : ''}`,
      ipAddress,
      userAgent,
      severity: 'INFO',
      category: 'KYC',
    });
  }

  /**
   * Log wire transfer approval/rejection
   */
  static async logWireTransferReview(
    adminUserId: string,
    transferId: string,
    userId: string,
    action: 'APPROVED' | 'REJECTED',
    notes: string | null,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.log({
      adminUserId,
      userId,
      action: `WIRE_TRANSFER_${action}`,
      entityType: 'WIRE_TRANSFER',
      entityId: transferId,
      details: `Wire transfer ${action.toLowerCase()}${notes ? `. Notes: ${notes}` : ''}`,
      ipAddress,
      userAgent,
      severity: 'INFO',
      category: 'TRANSACTION',
    });
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(
    adminUserId: string | null,
    userId: string | null,
    action: string,
    details: string,
    ipAddress: string,
    userAgent: string,
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' = 'WARNING'
  ): Promise<void> {
    await this.log({
      adminUserId: adminUserId,
      userId: userId,
      action,
      entityType: 'SECURITY',
      entityId: adminUserId || userId || 'SYSTEM',
      details,
      ipAddress,
      userAgent,
      severity,
      category: 'SECURITY',
    });
  }

  /**
   * Log system event
   */
  static async logSystemEvent(
    action: string,
    details: string,
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' = 'INFO'
  ): Promise<void> {
    await this.log({
      action,
      entityType: 'SYSTEM',
      entityId: 'SYSTEM',
      details,
      ipAddress: '127.0.0.1',
      userAgent: 'SYSTEM',
      severity,
      category: 'SYSTEM',
    });
  }
}