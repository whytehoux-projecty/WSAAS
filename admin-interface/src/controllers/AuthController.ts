import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { JWT_SECRET, BCRYPT_ROUNDS } from "../config/constants";
import { AuditService } from "../services/AuditService";

// Validation schemas
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
    ),
});

const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

export class AuthController {
  /**
   * Form-based login for web interface
   */
  static async formLogin(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = LoginSchema.parse(request.body);

      // Find admin user
      const adminUser = await prisma.adminUser.findUnique({
        where: { email },
      });

      if (!adminUser) {
        await AuditService.log({
          action: "LOGIN_FAILED",
          entityType: "ADMIN_USER",
          entityId: email,
          details: `Failed login attempt for email: ${email}`,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"] || "",
          severity: "WARNING",
          category: "AUTHENTICATION",
        });
        return reply.view("login.ejs", { 
          error: "Invalid credentials",
          email: email 
        });
      }

      if (adminUser.status !== "ACTIVE") {
        await AuditService.log({
          adminUserId: adminUser.id,
          action: "LOGIN_BLOCKED",
          entityType: "ADMIN_USER",
          entityId: adminUser.id,
          details: `Login blocked for inactive admin: ${email}`,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"] || "",
          severity: "WARNING",
          category: "AUTHENTICATION",
        });
        return reply.view("login.ejs", { 
          error: "Admin account is deactivated",
          email: email 
        });
      }

      // Check if account is locked
      if (adminUser.lockedUntil && adminUser.lockedUntil > new Date()) {
        return reply.view("login.ejs", { 
          error: "Account is temporarily locked due to multiple failed login attempts",
          email: email 
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        adminUser.password
      );
      if (!isValidPassword) {
        // Increment login attempts
        const updatedUser = await prisma.adminUser.update({
          where: { id: adminUser.id },
          data: {
            loginAttempts: adminUser.loginAttempts + 1,
            lockedUntil:
              adminUser.loginAttempts >= 4
                ? new Date(Date.now() + 30 * 60 * 1000) // Lock for 30 minutes after 5 attempts
                : null,
          },
        });

        await AuditService.log({
          adminUserId: adminUser.id,
          action: "LOGIN_FAILED",
          entityType: "ADMIN_USER",
          entityId: adminUser.id,
          details: `Failed login attempt ${updatedUser.loginAttempts}/5`,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"] || "",
          severity: "WARNING",
          category: "AUTHENTICATION",
        });

        return reply.view("login.ejs", { 
          error: "Invalid credentials",
          email: email 
        });
      }

      // Reset login attempts on successful login
      if (adminUser.loginAttempts > 0) {
        await prisma.adminUser.update({
          where: { id: adminUser.id },
          data: {
            loginAttempts: 0,
            lockedUntil: null,
          },
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
      ) as string;

      // Create session
      await prisma.adminSession.create({
        data: {
          adminUserId: adminUser.id,
          sessionId: token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"] || "",
        },
      });

      // Update last login
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { lastLoginAt: new Date() },
      });

      // Log successful login
      await AuditService.log({
        adminUserId: adminUser.id,
        action: "LOGIN_SUCCESS",
        entityType: "ADMIN_USER",
        entityId: adminUser.id,
        details: `Successful admin login`,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"] || "",
        severity: "INFO",
        category: "AUTHENTICATION",
      });

      // Set HTTP-only cookie
      reply.setCookie("admin_token", token, {
        httpOnly: true,
        secure: process.env["NODE_ENV"] === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: "/",
      });

      // Redirect to dashboard
      return reply.redirect("/dashboard");
    } catch (error) {
      request.log.error(error, "Form login error:");
      return reply.view("login.ejs", { 
        error: "An error occurred during login. Please try again.",
        email: "" 
      });
    }
  }

  /**
   * Form-based logout for web interface
   */
  static async formLogout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const token = request.cookies["admin_token"];

      if (token) {
        // Invalidate session
        await prisma.adminSession.updateMany({
          where: {
            sessionId: token,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });

        // Log logout
        if ((request as any).user) {
          await AuditService.log({
            adminUserId: (request as any).user.id,
            action: "LOGOUT",
            entityType: "ADMIN_USER",
            entityId: (request as any).user.id,
            details: "Admin logout",
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"] || "",
            severity: "INFO",
            category: "AUTHENTICATION",
          });
        }

        // Clear cookie
        reply.clearCookie("admin_token", { path: "/" });
      }

      // Redirect to login page
      return reply.redirect("/login");
    } catch (error) {
      request.log.error(error, "Form logout error:");
      return reply.redirect("/login");
    }
  }

  /**
   * Admin login
   */
  static async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = LoginSchema.parse(request.body);

      // Find admin user
      const adminUser = await prisma.adminUser.findUnique({
        where: { email },
      });

      if (!adminUser) {
        await AuditService.log({
          action: "LOGIN_FAILED",
          entityType: "ADMIN_USER",
          entityId: email,
          details: `Failed login attempt for email: ${email}`,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"] || "",
          severity: "WARNING",
          category: "AUTHENTICATION",
        });
        return reply.status(401).send({ error: "Invalid credentials" });
      }

      if (adminUser.status !== "ACTIVE") {
        await AuditService.log({
          adminUserId: adminUser.id,
          action: "LOGIN_BLOCKED",
          entityType: "ADMIN_USER",
          entityId: adminUser.id,
          details: `Login blocked for inactive admin: ${email}`,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"] || "",
          severity: "WARNING",
          category: "AUTHENTICATION",
        });
        return reply
          .status(401)
          .send({ error: "Admin account is deactivated" });
      }

      // Check if account is locked
      if (adminUser.lockedUntil && adminUser.lockedUntil > new Date()) {
        return reply.status(423).send({
          error:
            "Account is temporarily locked due to multiple failed login attempts",
          lockedUntil: adminUser.lockedUntil,
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        adminUser.password
      );
      if (!isValidPassword) {
        // Increment login attempts
        const updatedUser = await prisma.adminUser.update({
          where: { id: adminUser.id },
          data: {
            loginAttempts: adminUser.loginAttempts + 1,
            lockedUntil:
              adminUser.loginAttempts >= 4
                ? new Date(Date.now() + 30 * 60 * 1000) // Lock for 30 minutes after 5 attempts
                : null,
          },
        });

        await AuditService.log({
          adminUserId: adminUser.id,
          action: "LOGIN_FAILED",
          entityType: "ADMIN_USER",
          entityId: adminUser.id,
          details: `Failed login attempt ${updatedUser.loginAttempts}/5`,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"] || "",
          severity: "WARNING",
          category: "AUTHENTICATION",
        });

        return reply.status(401).send({ error: "Invalid credentials" });
      }

      // Reset login attempts on successful login
      if (adminUser.loginAttempts > 0) {
        await prisma.adminUser.update({
          where: { id: adminUser.id },
          data: {
            loginAttempts: 0,
            lockedUntil: null,
          },
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
      ) as string;

      // Create session
      await prisma.adminSession.create({
        data: {
          adminUserId: adminUser.id,
          sessionId: token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"] || "",
        },
      });

      // Update last login
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { lastLoginAt: new Date() },
      });

      // Log successful login
      await AuditService.log({
        adminUserId: adminUser.id,
        action: "LOGIN_SUCCESS",
        entityType: "ADMIN_USER",
        entityId: adminUser.id,
        details: `Successful admin login`,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"] || "",
        severity: "INFO",
        category: "AUTHENTICATION",
      });

      // Set HTTP-only cookie
      reply.setCookie("admin_token", token, {
        httpOnly: true,
        secure: process.env["NODE_ENV"] === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: "/",
      });

      return reply.send({
        user: {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role,
          permissions: adminUser.permissions,
        },
        token,
      });
    } catch (error) {
      request.log.error(error, "Login error:");
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  /**
   * Admin logout
   */
  static async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const token =
        request.cookies["admin_token"] ||
        request.headers.authorization?.replace("Bearer ", "");

      if (token) {
        // Invalidate session
        await prisma.adminSession.updateMany({
          where: {
            sessionId: token,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });

        // Log logout
        if ((request as any).user) {
          await AuditService.log({
            adminUserId: (request as any).user.id,
            action: "LOGOUT",
            entityType: "ADMIN_USER",
            entityId: (request as any).user.id,
            details: "Admin logout",
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"] || "",
            severity: "INFO",
            category: "AUTHENTICATION",
          });
        }

        // Clear cookie
        reply.clearCookie("admin_token", { path: "/" });
      }

      return reply.send({ message: "Logged out successfully" });
    } catch (error) {
      request.log.error(error, "Logout error:");
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  /**
   * Get current admin profile
   */
  static async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: (request as any).user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          permissions: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      if (!adminUser) {
        return reply.status(404).send({ error: "User not found" });
      }

      return reply.send({ user: adminUser });
    } catch (error) {
      request.log.error(error, "Error fetching profile:");
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  /**
   * Update admin profile
   */
  static async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const updates = UpdateProfileSchema.parse(request.body);
      const adminUserId = (request as any).user.id;

      // Filter out undefined values
      const filteredUpdates: Record<string, string> = {};
      if (updates.firstName !== undefined)
        filteredUpdates["firstName"] = updates.firstName;
      if (updates.lastName !== undefined)
        filteredUpdates["lastName"] = updates.lastName;

      const adminUser = await prisma.adminUser.update({
        where: { id: adminUserId },
        data: filteredUpdates,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          permissions: true,
        },
      });

      // Log profile update
      await AuditService.log({
        adminUserId,
        action: "PROFILE_UPDATE",
        entityType: "ADMIN_USER",
        entityId: adminUserId,
        details: `Profile updated: ${Object.keys(filteredUpdates).join(", ")}`,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"] || "",
        severity: "INFO",
        category: "ADMIN",
      });

      return reply.send({ user: adminUser });
    } catch (error) {
      request.log.error(error, "Error updating profile:");
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  /**
   * Change password
   */
  static async changePassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { currentPassword, newPassword } = ChangePasswordSchema.parse(
        request.body
      );
      const adminUserId = (request as any).user.id;

      // Get current admin user
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: adminUserId },
      });

      if (!adminUser) {
        return reply.status(404).send({ error: "User not found" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        adminUser.password
      );
      if (!isValidPassword) {
        await AuditService.log({
          adminUserId,
          action: "PASSWORD_CHANGE_FAILED",
          entityType: "ADMIN_USER",
          entityId: adminUserId,
          details: "Invalid current password provided",
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"] || "",
          severity: "WARNING",
          category: "AUTHENTICATION",
        });
        return reply
          .status(400)
          .send({ error: "Current password is incorrect" });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

      // Update password
      await prisma.adminUser.update({
        where: { id: adminUserId },
        data: { password: newPasswordHash },
      });

      // Invalidate all sessions except current one
      const currentToken =
        request.cookies["admin_token"] ||
        request.headers.authorization?.replace("Bearer ", "");

      if (currentToken) {
        await prisma.adminSession.updateMany({
          where: {
            adminUserId,
            isActive: true,
            sessionId: { not: currentToken },
          },
          data: {
            isActive: false,
          },
        });
      }

      // Log password change
      await AuditService.log({
        adminUserId,
        action: "PASSWORD_CHANGED",
        entityType: "ADMIN_USER",
        entityId: adminUserId,
        details: "Password successfully changed",
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"] || "",
        severity: "INFO",
        category: "AUTHENTICATION",
      });

      return reply.send({ message: "Password changed successfully" });
    } catch (error) {
      request.log.error(error, "Error changing password:");
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  /**
   * Verify token
   */
  static async verifyToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const token =
        request.cookies["admin_token"] ||
        request.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return reply.status(401).send({ error: "No token provided" });
      }

      // Verify JWT
      jwt.verify(token, JWT_SECRET);

      // Check if session is still active
      const session = await prisma.adminSession.findFirst({
        where: {
          sessionId: token,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
        include: {
          adminUser: true,
        },
      });

      if (!session || session.adminUser.status !== "ACTIVE") {
        return reply.status(401).send({ error: "Invalid or expired token" });
      }

      return reply.send({
        user: {
          id: session.adminUser.id,
          email: session.adminUser.email,
          firstName: session.adminUser.firstName,
          lastName: session.adminUser.lastName,
          role: session.adminUser.role,
          permissions: session.adminUser.permissions,
        },
      });
    } catch (error) {
      request.log.error(error, "Token verification error:");
      return reply.status(401).send({ error: "Invalid token" });
    }
  }
}
