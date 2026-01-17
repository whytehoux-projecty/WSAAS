import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { HTTP_STATUS, ERROR_CODES } from '@shared/index';

const prisma = new PrismaClient();

/**
 * JWT Authentication Middleware
 */
export const authenticateToken = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: ERROR_CODES.TOKEN_INVALID,
        message: 'Access token required',
      });
    }

    // Verify JWT token
    jwt.verify(token, process.env['JWT_SECRET']!) as { userId: string; email: string };

    // Check if session is still active
    const session = await prisma.userSession.findFirst({
      where: {
        sessionId: token,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            kycStatus: true,
          },
        },
      },
    });

    if (!session) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: ERROR_CODES.TOKEN_EXPIRED,
        message: 'Token expired or session invalid',
      });
    }

    // Check if user account is active
    if (session.user.status === 'SUSPENDED') {
      return reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: ERROR_CODES.ACCOUNT_SUSPENDED,
        message: 'Account is suspended',
      });
    }

    // Attach user info to request
    (request as any).user = {
      userId: session.user.id,
      email: session.user.email,
      status: session.user.status,
      kycStatus: session.user.kycStatus,
    };

    // Update session last activity
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() },
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: ERROR_CODES.TOKEN_INVALID,
        message: 'Invalid token',
      });
    }

    request.log.error('Authentication error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Authentication failed',
    });
  }
};

/**
 * KYC Status Check Middleware
 */
export const requireKYCVerified = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;

  if (!user) {
    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      success: false,
      error: ERROR_CODES.TOKEN_INVALID,
      message: 'Authentication required',
    });
  }

  if (user.kycStatus !== 'VERIFIED') {
    return reply.status(HTTP_STATUS.FORBIDDEN).send({
      success: false,
      error: ERROR_CODES.KYC_REQUIRED,
      message: 'KYC verification required to access this resource',
    });
  }
};

/**
 * Account Status Check Middleware
 */
export const requireActiveAccount = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;

  if (!user) {
    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      success: false,
      error: ERROR_CODES.TOKEN_INVALID,
      message: 'Authentication required',
    });
  }

  if (user.status !== 'ACTIVE') {
    return reply.status(HTTP_STATUS.FORBIDDEN).send({
      success: false,
      error: ERROR_CODES.ACCOUNT_INACTIVE,
      message: 'Account must be active to access this resource',
    });
  }
};

/**
 * Admin Role Check Middleware
 */
export const requireAdminRole = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;

  if (!user) {
    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      success: false,
      error: ERROR_CODES.TOKEN_INVALID,
      message: 'Authentication required',
    });
  }

  // Check if user has admin privileges (AdminUser identified by email in this schema)
  const adminUser = await prisma.adminUser.findUnique({
    where: { email: user.email },
  });

  if (!adminUser || adminUser.status !== 'ACTIVE') {
    return reply.status(HTTP_STATUS.FORBIDDEN).send({
      success: false,
      error: ERROR_CODES.INSUFFICIENT_PERMISSIONS,
      message: 'Admin privileges required',
    });
  }

  // Attach admin info to request
  (request as any).admin = adminUser;
};

/**
 * Permission Check Middleware Factory
 */
export const requirePermission = (permission: string) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const admin = (request as any).admin;

    if (!admin) {
      return reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        message: 'Admin privileges required',
      });
    }

    const permissions = (admin.permissions as string[]) || [];
    
    if (!permissions.includes(permission) && !permissions.includes('*')) {
      return reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        message: `Permission '${permission}' required`,
      });
    }
  };
};

/**
 * Rate Limiting Middleware
 */
export const rateLimitByUser = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const userId = user?.userId || request.ip;
    const now = Date.now();

    const userLimit = userRequests.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return;
    }

    if (userLimit.count >= maxRequests) {
      return reply.status(HTTP_STATUS.TOO_MANY_REQUESTS).send({
        success: false,
        error: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
      });
    }

    userLimit.count++;
  };
};

/**
 * Account Ownership Middleware
 */
export const requireAccountOwnership = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const accountId = (request.params as any).accountId;

  if (!user || !accountId) {
    return reply.status(HTTP_STATUS.BAD_REQUEST).send({
      success: false,
      error: ERROR_CODES.VALIDATION_FAILED,
      message: 'User authentication and account ID required',
    });
  }

  // Check if user owns the account
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId: user.userId,
    },
  });

  if (!account) {
    return reply.status(HTTP_STATUS.FORBIDDEN).send({
      success: false,
      error: ERROR_CODES.INSUFFICIENT_PERMISSIONS,
      message: 'Access denied. Account not found or not owned by user.',
    });
  }

  // Attach account to request
  (request as any).account = account;
};

/**
 * Transaction Ownership Middleware
 */
export const requireTransactionOwnership = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const transactionId = (request.params as any).transactionId;

  if (!user || !transactionId) {
    return reply.status(HTTP_STATUS.BAD_REQUEST).send({
      success: false,
      error: ERROR_CODES.VALIDATION_FAILED,
      message: 'User authentication and transaction ID required',
    });
  }

  // Check if user owns the transaction via the linked account
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      account: { userId: user.userId },
    },
    include: {
      account: true,
    },
  });

  if (!transaction) {
    return reply.status(HTTP_STATUS.FORBIDDEN).send({
      success: false,
      error: ERROR_CODES.INSUFFICIENT_PERMISSIONS,
      message: 'Access denied. Transaction not found or not accessible by user.',
    });
  }

  // Attach transaction to request
  (request as any).transaction = transaction;
};