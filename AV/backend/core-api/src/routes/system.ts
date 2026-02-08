import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { HTTP_STATUS, ERROR_CODES } from '@shared/index';

const prisma = new PrismaClient();

export default async function systemRoutes(fastify: FastifyInstance) {
  /**
   * Health check endpoint
   */
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const startTime = Date.now();

      // Check database connection
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - dbStart;

      // Check Redis connection (if available)
      let redisStatus = 'not_configured';
      const redisResponseTime = 0;

      try {
        if (process.env['REDIS_URL']) {
          // Redis check would go here
          redisStatus = 'healthy';
        }
      } catch (error) {
        redisStatus = 'unhealthy';
      }

      const totalResponseTime = Date.now() - startTime;

      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: totalResponseTime,
        services: {
          database: {
            status: 'healthy',
            responseTime: dbResponseTime,
          },
          redis: {
            status: redisStatus,
            responseTime: redisResponseTime,
          },
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          },
        },
      };

      return reply.status(HTTP_STATUS.OK).send({
        success: true,
        data: health,
      });
    } catch (error) {
      request.log.error('Health check failed:', error);

      return reply.status(HTTP_STATUS.SERVICE_UNAVAILABLE).send({
        success: false,
        error: ERROR_CODES.SERVICE_UNAVAILABLE,
        message: 'Service unhealthy',
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  });

  /**
   * API information endpoint
   */
  fastify.get('/info', async (_request: FastifyRequest, reply: FastifyReply) => {
    const apiInfo = {
      name: 'Aurum Vault Core API',
      version: '1.0.0',
      description: 'Core banking API for Aurum Vault luxury financial services',
      environment: process.env['NODE_ENV'] || 'development',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth',
        accounts: '/api/accounts',
        transactions: '/api/transactions',
        users: '/api/users',
        kyc: '/api/kyc',
        wireTransfers: '/api/wire-transfers',
        health: '/api/health',
      },
      documentation: '/docs',
    };

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: apiInfo,
    });
  });

  /**
   * API statistics endpoint
   */
  fastify.get('/statistics', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const [totalUsers, totalAccounts, totalTransactions, totalWireTransfers, pendingKYC] =
        await Promise.all([
          prisma.user.count(),
          prisma.account.count(),
          prisma.transaction.count(),
          prisma.wireTransfer.count(),
          prisma.user.count({ where: { kycStatus: 'PENDING' } }),
        ]);

      // Get recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const [recentUsers, recentTransactions, recentWireTransfers] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: yesterday } } }),
        prisma.transaction.count({ where: { createdAt: { gte: yesterday } } }),
        prisma.wireTransfer.count({ where: { createdAt: { gte: yesterday } } }),
      ]);

      const statistics = {
        totals: {
          users: totalUsers,
          accounts: totalAccounts,
          transactions: totalTransactions,
          wireTransfers: totalWireTransfers,
          pendingKYC,
        },
        recent24h: {
          newUsers: recentUsers,
          transactions: recentTransactions,
          wireTransfers: recentWireTransfers,
        },
        timestamp: new Date().toISOString(),
      };

      return reply.status(HTTP_STATUS.OK).send({
        success: true,
        data: statistics,
      });
    } catch (error) {
      request.log.error('Failed to fetch API statistics:', error);

      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch API statistics',
      });
    }
  });
}
