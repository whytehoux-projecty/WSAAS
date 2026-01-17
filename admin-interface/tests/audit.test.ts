import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { prisma } from "../src/lib/prisma";
import { AuditService } from "../src/services/AuditService";

describe("AuditService", () => {
  let testAdminUserId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create test users for audit logging
    const adminUser = await prisma.adminUser.create({
      data: {
        email: "audit-admin@test.com",
        firstName: "Audit",
        lastName: "Admin",
        passwordHash: "test-hash",
        isActive: true,
        roleId: "admin-role-id",
      },
    });
    testAdminUserId = adminUser.id;

    const user = await prisma.user.create({
      data: {
        email: "audit-user@test.com",
        firstName: "Audit",
        lastName: "User",
        status: "ACTIVE",
        kycStatus: "PENDING",
        phoneNumber: "+1234567890",
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.auditLog.deleteMany({
      where: {
        OR: [{ adminUserId: testAdminUserId }, { userId: testUserId }],
      },
    });
    await prisma.adminUser.delete({
      where: { id: testAdminUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
    await prisma.$disconnect();
  });

  describe("log", () => {
    it("should create audit log entry", async () => {
      await AuditService.log({
        adminUserId: testAdminUserId,
        userId: testUserId,
        action: "TEST_ACTION",
        entityType: "USER",
        entityId: testUserId,
        details: "Test audit log entry",
        ipAddress: "127.0.0.1",
        userAgent: "Test Agent",
        severity: "INFO",
        category: "TEST",
      });

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminUserId: testAdminUserId,
          action: "TEST_ACTION",
        },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog?.adminUserId).toBe(testAdminUserId);
      expect(auditLog?.userId).toBe(testUserId);
      expect(auditLog?.action).toBe("TEST_ACTION");
      expect(auditLog?.entityType).toBe("USER");
      expect(auditLog?.details).toBe("Test audit log entry");
      expect(auditLog?.severity).toBe("INFO");
      expect(auditLog?.category).toBe("TEST");
    });

    it("should handle missing optional fields", async () => {
      await AuditService.log({
        action: "SYSTEM_ACTION",
        entityType: "SYSTEM",
        entityId: "SYSTEM",
        details: "System action without user",
        ipAddress: "127.0.0.1",
        userAgent: "System",
        severity: "INFO",
        category: "SYSTEM",
      });

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: "SYSTEM_ACTION",
          adminUserId: null,
          userId: null,
        },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog?.adminUserId).toBeNull();
      expect(auditLog?.userId).toBeNull();
    });
  });

  describe("logAdminLogin", () => {
    it("should log successful admin login", async () => {
      await AuditService.logAdminLogin(
        testAdminUserId,
        "192.168.1.1",
        "Mozilla/5.0",
        true
      );

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminUserId: testAdminUserId,
          action: "ADMIN_LOGIN_SUCCESS",
        },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog?.severity).toBe("INFO");
      expect(auditLog?.category).toBe("AUTH");
      expect(auditLog?.ipAddress).toBe("192.168.1.1");
    });

    it("should log failed admin login", async () => {
      await AuditService.logAdminLogin(
        testAdminUserId,
        "192.168.1.1",
        "Mozilla/5.0",
        false
      );

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminUserId: testAdminUserId,
          action: "ADMIN_LOGIN_FAILED",
        },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog?.severity).toBe("WARNING");
      expect(auditLog?.category).toBe("AUTH");
    });
  });

  describe("logAdminLogout", () => {
    it("should log admin logout", async () => {
      await AuditService.logAdminLogout(
        testAdminUserId,
        "192.168.1.1",
        "Mozilla/5.0"
      );

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminUserId: testAdminUserId,
          action: "ADMIN_LOGOUT",
        },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog?.severity).toBe("INFO");
      expect(auditLog?.category).toBe("AUTH");
    });
  });

  describe("logPasswordChange", () => {
    it("should log password change", async () => {
      await AuditService.logPasswordChange(
        testAdminUserId,
        "192.168.1.1",
        "Mozilla/5.0"
      );

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminUserId: testAdminUserId,
          action: "PASSWORD_CHANGE",
        },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog?.severity).toBe("INFO");
      expect(auditLog?.category).toBe("SECURITY");
    });
  });

  describe("logUserStatusChange", () => {
    it("should log user status change", async () => {
      await AuditService.logUserStatusChange(
        testAdminUserId,
        testUserId,
        "ACTIVE",
        "SUSPENDED",
        "Suspicious activity",
        "192.168.1.1",
        "Mozilla/5.0"
      );

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminUserId: testAdminUserId,
          userId: testUserId,
          action: "USER_STATUS_CHANGE",
        },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog?.severity).toBe("WARNING");
      expect(auditLog?.category).toBe("USER_MANAGEMENT");
      expect(auditLog?.details).toContain("ACTIVE");
      expect(auditLog?.details).toContain("SUSPENDED");
      expect(auditLog?.details).toContain("Suspicious activity");
    });
  });

  describe("logKYCStatusChange", () => {
    it("should log KYC status change", async () => {
      await AuditService.logKYCStatusChange(
        testAdminUserId,
        testUserId,
        "PENDING",
        "VERIFIED",
        "All documents verified",
        "192.168.1.1",
        "Mozilla/5.0"
      );

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminUserId: testAdminUserId,
          userId: testUserId,
          action: "KYC_STATUS_CHANGE",
        },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog?.severity).toBe("INFO");
      expect(auditLog?.category).toBe("KYC");
      expect(auditLog?.details).toContain("PENDING");
      expect(auditLog?.details).toContain("VERIFIED");
      expect(auditLog?.details).toContain("All documents verified");
    });
  });

  describe("logSecurityEvent", () => {
    it("should log security event", async () => {
      await AuditService.logSecurityEvent(
        testAdminUserId,
        testUserId,
        "SUSPICIOUS_LOGIN_ATTEMPT",
        "Multiple failed login attempts detected",
        "192.168.1.1",
        "Mozilla/5.0",
        "CRITICAL"
      );

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminUserId: testAdminUserId,
          action: "SUSPICIOUS_LOGIN_ATTEMPT",
        },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog?.severity).toBe("CRITICAL");
      expect(auditLog?.category).toBe("SECURITY");
      expect(auditLog?.entityType).toBe("SECURITY");
    });
  });

  describe("logSystemEvent", () => {
    it("should log system event", async () => {
      await AuditService.logSystemEvent(
        "SYSTEM_STARTUP",
        "Admin interface started successfully",
        "INFO"
      );

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: "SYSTEM_STARTUP",
          entityType: "SYSTEM",
        },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog?.severity).toBe("INFO");
      expect(auditLog?.category).toBe("SYSTEM");
      expect(auditLog?.adminUserId).toBeNull();
      expect(auditLog?.userId).toBeNull();
    });
  });
});
