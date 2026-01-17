import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { validationSchemas, HTTP_STATUS, ERROR_CODES } from '@shared/index';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Get all users with pagination and filtering
 */
export const getUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = validationSchemas.userQuery.parse(request.query);

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.kycStatus) {
      where.kycStatus = query.kycStatus;
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          kycStatus: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              accounts: true,
              kycDocuments: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: users,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: ERROR_CODES.VALIDATION_FAILED,
        message: 'Invalid query parameters',
        details: error.errors,
      });
    }

    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to fetch users',
    });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        accounts: {
          select: {
            id: true,
            accountNumber: true,
            accountType: true,
            balance: true,
            status: true,
            createdAt: true,
          },
        },
        kycDocuments: {
          select: {
            id: true,
            documentType: true,
            verificationStatus: true,
            createdAt: true,
            verifiedAt: true,
          },
        },
        _count: {
          select: {
            accounts: true,
            kycDocuments: true,
          },
        },
      },
    });

    if (!user) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: ERROR_CODES.ACCOUNT_NOT_FOUND,
        message: 'User not found',
      });
    }

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: user,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to fetch user',
    });
  }
};

// Alias for getUserById to match index.ts import
export const getUser = getUserById;

/**
 * Create a new user
 */
export const createUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userData = validationSchemas.adminCreateUser.parse(request.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      return reply.status(HTTP_STATUS.CONFLICT).send({
        success: false,
        error: ERROR_CODES.VALIDATION_FAILED,
        message: 'User with this email already exists',
      });
    }

    const { address, ...rest } = userData as any;
    const hashedPassword = await bcrypt.hash(rest.password, 12);

    const user = await prisma.user.create({
      data: {
        ...rest,
        password: hashedPassword,
        ...(address ? { address: { create: address } } : {}),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        kycStatus: true,
        createdAt: true,
      },
    });

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: ERROR_CODES.VALIDATION_FAILED,
        message: 'Invalid user data',
        details: error.errors,
      });
    }

    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to create user',
    });
  }
};

/**
 * Update user
 */
export const updateUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const updateData = validationSchemas.updateUser.parse(request.body) as any;

    const { address, ...rest } = updateData;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(address ? { address: { upsert: { create: address, update: address } } } : {}),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        kycStatus: true,
        updatedAt: true,
      },
    });

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: ERROR_CODES.VALIDATION_FAILED,
        message: 'Invalid update data',
        details: error.errors,
      });
    }

    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to update user',
    });
  }
};

/**
 * Suspend user
 */
export const suspendUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };

    const user = await prisma.user.update({
      where: { id },
      data: { status: 'SUSPENDED' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: id,
        action: 'USER_SUSPENDED',
        entityType: 'USER',
        entityId: id,
        details: JSON.stringify({ suspendedBy: 'admin' }), // Should include actual admin ID
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      },
    });

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: user,
      message: 'User suspended successfully',
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to suspend user',
    });
  }
};

/**
 * Activate user
 */
export const activateUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };

    const user = await prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: id,
        action: 'USER_ACTIVATED',
        entityType: 'USER',
        entityId: id,
        details: JSON.stringify({ activatedBy: 'admin' }), // Should include actual admin ID
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      },
    });

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: user,
      message: 'User activated successfully',
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to activate user',
    });
  }
};

/**
 * Get user statistics
 */
export const getUserStatistics = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = validationSchemas.statisticsQuery.parse(request.query);

    const dateFilter: any = {};
    if (query.startDate) {
      dateFilter.gte = new Date(query.startDate);
    }
    if (query.endDate) {
      dateFilter.lte = new Date(query.endDate);
    }

    const [totalUsers, activeUsers, suspendedUsers, pendingVerification, newUsersCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count({ where: { status: 'SUSPENDED' } }),
        prisma.user.count({ where: { status: 'PENDING_VERIFICATION' } }),
        prisma.user.count({
          where: {
            createdAt: dateFilter,
          },
        }),
      ]);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        pendingVerification,
        newUsers: newUsersCount,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: ERROR_CODES.VALIDATION_FAILED,
        message: 'Invalid query parameters',
        details: error.errors,
      });
    }

    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to fetch user statistics',
    });
  }
};

// Default export function to register routes
export default async function userRoutes(fastify: FastifyInstance) {
  // Get all users (admin only)
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    handler: getUsers,
  });

  // Get user by ID
  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    handler: getUserById,
  });

  // Create new user (admin only)
  fastify.post('/', {
    preHandler: [fastify.authenticate],
    handler: createUser,
  });

  // Update user
  fastify.put('/:id', {
    preHandler: [fastify.authenticate],
    handler: updateUser,
  });

  // Suspend user (admin only)
  fastify.post('/:id/suspend', {
    preHandler: [fastify.authenticate],
    handler: suspendUser,
  });

  // Activate user (admin only)
  fastify.post('/:id/activate', {
    preHandler: [fastify.authenticate],
    handler: activateUser,
  });

  // Get user statistics (admin only)
  fastify.get('/statistics', {
    preHandler: [fastify.authenticate],
    handler: getUserStatistics,
  });
}
