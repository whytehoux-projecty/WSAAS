import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import { FastifyInstance } from "fastify";
import { build } from "../src/server";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcrypt";

describe("Admin Routes", () => {
  let app: FastifyInstance;
  let adminUser: any;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    app = build({ logger: false });
    await app.ready();

    // Create test admin user
    const passwordHash = await bcrypt.hash("TestPassword123!", 12);
    adminUser = await prisma.adminUser.create({
      data: {
        email: "admin@test.com",
        firstName: "Admin",
        lastName: "User",
        passwordHash,
        isActive: true,
        roleId: "admin-role-id", // This would need to exist in your test setup
      },
    });

    // Create test regular user
    testUser = await prisma.user.create({
      data: {
        email: "user@test.com",
        firstName: "Test",
        lastName: "User",
        status: "ACTIVE",
        kycStatus: "PENDING",
        phoneNumber: "+1234567890",
      },
    });

    // Login to get auth token
    const loginResponse = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: "admin@test.com",
        password: "TestPassword123!",
      },
    });

    const cookies = loginResponse.cookies;
    authToken = cookies.find((c) => c.name === "admin_token")?.value || "";
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.adminSession.deleteMany({
      where: { adminUserId: adminUser.id },
    });
    await prisma.adminUser.delete({
      where: { id: adminUser.id },
    });
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    await app.close();
    await prisma.$disconnect();
  });

  describe("GET /api/admin/dashboard/stats", () => {
    it("should return dashboard statistics", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/dashboard/stats",
        cookies: { admin_token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.users).toBeDefined();
      expect(body.accounts).toBeDefined();
      expect(body.transactions).toBeDefined();
      expect(body.wireTransfers).toBeDefined();
      expect(typeof body.users.total).toBe("number");
      expect(typeof body.users.active).toBe("number");
      expect(typeof body.users.pendingKYC).toBe("number");
    });

    it("should require authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/dashboard/stats",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/admin/users", () => {
    it("should return paginated users list", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/users?page=1&limit=10",
        cookies: { admin_token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.users).toBeDefined();
      expect(body.pagination).toBeDefined();
      expect(Array.isArray(body.users)).toBe(true);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(10);
    });

    it("should filter users by status", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/users?status=ACTIVE",
        cookies: { admin_token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.users).toBeDefined();
      // All returned users should have ACTIVE status
      body.users.forEach((user: any) => {
        expect(user.status).toBe("ACTIVE");
      });
    });

    it("should search users by name or email", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/users?search=Test",
        cookies: { admin_token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.users).toBeDefined();
    });

    it("should require authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/users",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/admin/users/:userId", () => {
    it("should return user details", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/admin/users/${testUser.id}`,
        cookies: { admin_token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user).toBeDefined();
      expect(body.user.id).toBe(testUser.id);
      expect(body.user.email).toBe(testUser.email);
    });

    it("should return 404 for non-existent user", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/users/non-existent-id",
        cookies: { admin_token: authToken },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("User not found");
    });

    it("should require authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/admin/users/${testUser.id}`,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("PUT /api/admin/users/:userId/status", () => {
    it("should update user status", async () => {
      const response = await app.inject({
        method: "PUT",
        url: `/api/admin/users/${testUser.id}/status`,
        cookies: { admin_token: authToken },
        payload: {
          status: "SUSPENDED",
          reason: "Test suspension",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user).toBeDefined();
      expect(body.user.status).toBe("SUSPENDED");
    });

    it("should validate status values", async () => {
      const response = await app.inject({
        method: "PUT",
        url: `/api/admin/users/${testUser.id}/status`,
        cookies: { admin_token: authToken },
        payload: {
          status: "INVALID_STATUS",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should require authentication", async () => {
      const response = await app.inject({
        method: "PUT",
        url: `/api/admin/users/${testUser.id}/status`,
        payload: {
          status: "ACTIVE",
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("PUT /api/admin/users/:userId/kyc-status", () => {
    it("should update KYC status", async () => {
      const response = await app.inject({
        method: "PUT",
        url: `/api/admin/users/${testUser.id}/kyc-status`,
        cookies: { admin_token: authToken },
        payload: {
          kycStatus: "VERIFIED",
          reviewNotes: "Documents verified",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user).toBeDefined();
      expect(body.user.kycStatus).toBe("VERIFIED");
    });

    it("should validate KYC status values", async () => {
      const response = await app.inject({
        method: "PUT",
        url: `/api/admin/users/${testUser.id}/kyc-status`,
        cookies: { admin_token: authToken },
        payload: {
          kycStatus: "INVALID_STATUS",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should require authentication", async () => {
      const response = await app.inject({
        method: "PUT",
        url: `/api/admin/users/${testUser.id}/kyc-status`,
        payload: {
          kycStatus: "VERIFIED",
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/admin/transactions", () => {
    it("should return paginated transactions list", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/transactions?page=1&limit=10",
        cookies: { admin_token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.transactions).toBeDefined();
      expect(body.pagination).toBeDefined();
      expect(Array.isArray(body.transactions)).toBe(true);
    });

    it("should filter transactions by user", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/admin/transactions?userId=${testUser.id}`,
        cookies: { admin_token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.transactions).toBeDefined();
    });

    it("should require authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/transactions",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/admin/wire-transfers", () => {
    it("should return paginated wire transfers list", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/wire-transfers?page=1&limit=10",
        cookies: { admin_token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.wireTransfers).toBeDefined();
      expect(body.pagination).toBeDefined();
      expect(Array.isArray(body.wireTransfers)).toBe(true);
    });

    it("should filter wire transfers by status", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/wire-transfers?status=PENDING",
        cookies: { admin_token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.wireTransfers).toBeDefined();
    });

    it("should require authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/wire-transfers",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/admin/audit-logs", () => {
    it("should return paginated audit logs", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/audit-logs?page=1&limit=10",
        cookies: { admin_token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.auditLogs).toBeDefined();
      expect(body.pagination).toBeDefined();
      expect(Array.isArray(body.auditLogs)).toBe(true);
    });

    it("should filter audit logs by user", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/admin/audit-logs?userId=${testUser.id}`,
        cookies: { admin_token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.auditLogs).toBeDefined();
    });

    it("should require authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/admin/audit-logs",
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
