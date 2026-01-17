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

describe("Authentication Routes", () => {
  let app: FastifyInstance;
  let adminUser: any;

  beforeAll(async () => {
    app = build({ logger: false });
    await app.ready();

    // Create test admin user
    const passwordHash = await bcrypt.hash("TestPassword123!", 12);
    adminUser = await prisma.adminUser.create({
      data: {
        email: "test@admin.com",
        firstName: "Test",
        lastName: "Admin",
        passwordHash,
        isActive: true,
        roleId: "admin-role-id", // This would need to exist in your test setup
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.adminSession.deleteMany({
      where: { adminUserId: adminUser.id },
    });
    await prisma.adminUser.delete({
      where: { id: adminUser.id },
    });
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up sessions before each test
    await prisma.adminSession.deleteMany({
      where: { adminUserId: adminUser.id },
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "test@admin.com",
          password: "TestPassword123!",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("Login successful");
      expect(body.admin).toBeDefined();
      expect(body.admin.email).toBe("test@admin.com");
      expect(response.cookies).toHaveLength(1);
      expect(response.cookies[0].name).toBe("admin_token");
    });

    it("should reject invalid credentials", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "test@admin.com",
          password: "wrongpassword",
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Invalid credentials");
    });

    it("should reject non-existent user", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "nonexistent@admin.com",
          password: "TestPassword123!",
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Invalid credentials");
    });

    it("should validate input format", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "invalid-email",
          password: "",
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/auth/logout", () => {
    let authToken: string;

    beforeEach(async () => {
      // Login to get a token
      const loginResponse = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "test@admin.com",
          password: "TestPassword123!",
        },
      });

      const cookies = loginResponse.cookies;
      authToken = cookies.find((c) => c.name === "admin_token")?.value || "";
    });

    it("should logout successfully", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/logout",
        cookies: { admin_token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("Logout successful");
    });

    it("should require authentication", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/logout",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/auth/profile", () => {
    let authToken: string;

    beforeEach(async () => {
      // Login to get a token
      const loginResponse = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "test@admin.com",
          password: "TestPassword123!",
        },
      });

      const cookies = loginResponse.cookies;
      authToken = cookies.find((c) => c.name === "admin_token")?.value || "";
    });

    it("should return admin profile", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/profile",
        cookies: { admin_token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.admin).toBeDefined();
      expect(body.admin.email).toBe("test@admin.com");
      expect(body.admin.firstName).toBe("Test");
      expect(body.admin.lastName).toBe("Admin");
    });

    it("should require authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/profile",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("PUT /api/auth/profile", () => {
    let authToken: string;

    beforeEach(async () => {
      // Login to get a token
      const loginResponse = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "test@admin.com",
          password: "TestPassword123!",
        },
      });

      const cookies = loginResponse.cookies;
      authToken = cookies.find((c) => c.name === "admin_token")?.value || "";
    });

    it("should update admin profile", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/auth/profile",
        cookies: { admin_token: authToken },
        payload: {
          firstName: "Updated",
          lastName: "Name",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("Profile updated successfully");
      expect(body.admin.firstName).toBe("Updated");
      expect(body.admin.lastName).toBe("Name");
    });

    it("should require authentication", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/auth/profile",
        payload: {
          firstName: "Updated",
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("PUT /api/auth/change-password", () => {
    let authToken: string;

    beforeEach(async () => {
      // Login to get a token
      const loginResponse = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "test@admin.com",
          password: "TestPassword123!",
        },
      });

      const cookies = loginResponse.cookies;
      authToken = cookies.find((c) => c.name === "admin_token")?.value || "";
    });

    it("should change password with valid current password", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/auth/change-password",
        cookies: { admin_token: authToken },
        payload: {
          currentPassword: "TestPassword123!",
          newPassword: "NewPassword123!",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("Password changed successfully");
    });

    it("should reject invalid current password", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/auth/change-password",
        cookies: { admin_token: authToken },
        payload: {
          currentPassword: "wrongpassword",
          newPassword: "NewPassword123!",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Current password is incorrect");
    });

    it("should validate new password format", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/auth/change-password",
        cookies: { admin_token: authToken },
        payload: {
          currentPassword: "TestPassword123!",
          newPassword: "weak",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should require authentication", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/auth/change-password",
        payload: {
          currentPassword: "TestPassword123!",
          newPassword: "NewPassword123!",
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/auth/verify", () => {
    let authToken: string;

    beforeEach(async () => {
      // Login to get a token
      const loginResponse = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "test@admin.com",
          password: "TestPassword123!",
        },
      });

      const cookies = loginResponse.cookies;
      authToken = cookies.find((c) => c.name === "admin_token")?.value || "";
    });

    it("should verify valid token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/verify",
        cookies: { admin_token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.valid).toBe(true);
      expect(body.admin).toBeDefined();
    });

    it("should reject invalid token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/verify",
        cookies: { admin_token: "invalid-token" },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should require authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/verify",
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
