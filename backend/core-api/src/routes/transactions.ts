import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation schemas
const transferSchema = z.object({
  fromAccountId: z.string(),
  toAccountId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  description: z.string().min(1),
  reference: z.string().optional(),
  category: z.string().optional(),
});

export default async function transactionRoutes(fastify: FastifyInstance) {
  // Get all transactions for user
  fastify.get(
    '/',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get all transactions for the authenticated user',
        tags: ['Transactions'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            accountId: { type: 'string' },
            type: { type: 'string' },
            status: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              transactions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    type: { type: 'string' },
                    amount: { type: 'number' },
                    currency: { type: 'string' },
                    status: { type: 'string' },
                    description: { type: 'string' },
                    reference: { type: 'string' },
                    createdAt: { type: 'string' },
                    account: {
                      type: 'object',
                      properties: {
                        accountNumber: { type: 'string' },
                        accountType: { type: 'string' },
                      },
                    },
                  },
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  total: { type: 'integer' },
                  pages: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const {
          page = 1,
          limit = 20,
          accountId,
          type,
          status,
          startDate,
          endDate,
        } = request.query as any;

        // Get user's account IDs
        const userAccounts = await prisma.account.findMany({
          where: { userId: user.userId },
          select: { id: true },
        });

        const accountIds = userAccounts.map((acc: any) => acc.id);

        if (accountIds.length === 0) {
          return reply.send({
            transactions: [],
            pagination: { page, limit, total: 0, pages: 0 },
          });
        }

        const where: any = {
          accountId: { in: accountId ? [accountId] : accountIds },
        };

        if (type) where.type = type;
        if (status) where.status = status;
        if (startDate || endDate) {
          where.createdAt = {};
          if (startDate) where.createdAt.gte = new Date(startDate);
          if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const [transactions, total] = await Promise.all([
          prisma.transaction.findMany({
            where,
            include: {
              account: {
                select: {
                  accountNumber: true,
                  accountType: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          prisma.transaction.count({ where }),
        ]);

        const pages = Math.ceil(total / limit);

        reply.send({
          transactions,
          pagination: { page, limit, total, pages },
        });
      } catch (error) {
        fastify.log.error('Get transactions error:', error);
        reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to fetch transactions',
        });
      }
    }
  );

  // Get specific transaction
  fastify.get(
    '/:transactionId',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get specific transaction details',
        tags: ['Transactions'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            transactionId: { type: 'string' },
          },
          required: ['transactionId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              transaction: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string' },
                  amount: { type: 'number' },
                  currency: { type: 'string' },
                  status: { type: 'string' },
                  description: { type: 'string' },
                  reference: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  account: {
                    type: 'object',
                    properties: {
                      accountNumber: { type: 'string' },
                      accountType: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const { transactionId } = request.params as { transactionId: string };

        const transaction = await prisma.transaction.findFirst({
          where: {
            id: transactionId,
            account: {
              userId: user.userId,
            },
          },
          include: {
            account: {
              select: {
                accountNumber: true,
                accountType: true,
              },
            },
          },
        });

        if (!transaction) {
          return reply.status(404).send({
            error: 'Transaction Not Found',
            message: 'Transaction not found or access denied',
          });
        }

        reply.send({ transaction });
      } catch (error) {
        fastify.log.error('Get transaction error:', error);
        reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to fetch transaction',
        });
      }
    }
  );

  // Create deposit transaction
  fastify.post(
    '/deposit',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Create a deposit transaction',
        tags: ['Transactions'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['accountId', 'amount', 'description'],
          properties: {
            accountId: { type: 'string' },
            amount: { type: 'number', minimum: 0.01 },
            currency: { type: 'string', default: 'USD' },
            description: { type: 'string', minLength: 1 },
            reference: { type: 'string' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              transaction: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string' },
                  amount: { type: 'number' },
                  currency: { type: 'string' },
                  status: { type: 'string' },
                  description: { type: 'string' },
                  reference: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const { accountId, amount, currency = 'USD', description, reference } = request.body as any;

        // Verify account ownership
        const account = await prisma.account.findFirst({
          where: {
            id: accountId,
            userId: user.userId,
            status: 'ACTIVE',
          },
        });

        if (!account) {
          return reply.status(404).send({
            error: 'Account Not Found',
            message: 'Account not found, inactive, or access denied',
          });
        }

        // Create transaction and update balance in a transaction
        const result = await prisma.$transaction(async (tx: any) => {
          // Create transaction record
          const transaction = await tx.transaction.create({
            data: {
              accountId,
              type: 'DEPOSIT',
              amount,
              currency,
              status: 'COMPLETED',
              description,
              reference: reference || `DEP-${Date.now()}`,
            },
          });

          // Update account balance
          await tx.account.update({
            where: { id: accountId },
            data: {
              balance: {
                increment: amount,
              },
            },
          });

          return transaction;
        });

        reply.status(201).send({
          message: 'Deposit completed successfully',
          transaction: result,
        });
      } catch (error) {
        fastify.log.error('Deposit error:', error);
        reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to process deposit',
        });
      }
    }
  );

  // Create withdrawal transaction
  fastify.post(
    '/withdrawal',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Create a withdrawal transaction',
        tags: ['Transactions'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['accountId', 'amount', 'description'],
          properties: {
            accountId: { type: 'string' },
            amount: { type: 'number', minimum: 0.01 },
            currency: { type: 'string', default: 'USD' },
            description: { type: 'string', minLength: 1 },
            reference: { type: 'string' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              transaction: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string' },
                  amount: { type: 'number' },
                  currency: { type: 'string' },
                  status: { type: 'string' },
                  description: { type: 'string' },
                  reference: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const { accountId, amount, currency = 'USD', description, reference } = request.body as any;

        // Verify account ownership and sufficient balance
        const account = await prisma.account.findFirst({
          where: {
            id: accountId,
            userId: user.userId,
            status: 'ACTIVE',
          },
        });

        if (!account) {
          return reply.status(404).send({
            error: 'Account Not Found',
            message: 'Account not found, inactive, or access denied',
          });
        }

        if (account.balance < amount) {
          return reply.status(400).send({
            error: 'Insufficient Funds',
            message: 'Account balance is insufficient for this withdrawal',
          });
        }

        // Check daily limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayWithdrawals = await prisma.transaction.aggregate({
          where: {
            accountId,
            type: 'WITHDRAWAL',
            status: 'COMPLETED',
            createdAt: { gte: today },
          },
          _sum: { amount: true },
        });

        const todayTotal = (todayWithdrawals._sum.amount || 0) + amount;
        if (todayTotal > account.dailyLimit) {
          return reply.status(400).send({
            error: 'Daily Limit Exceeded',
            message: `Daily withdrawal limit of ${account.dailyLimit} ${currency} exceeded`,
          });
        }

        // Create transaction and update balance
        const result = await prisma.$transaction(async (tx: any) => {
          const transaction = await tx.transaction.create({
            data: {
              accountId,
              type: 'WITHDRAWAL',
              amount,
              currency,
              status: 'COMPLETED',
              description,
              reference: reference || `WTH-${Date.now()}`,
            },
          });

          await tx.account.update({
            where: { id: accountId },
            data: {
              balance: {
                decrement: amount,
              },
            },
          });

          return transaction;
        });

        reply.status(201).send({
          message: 'Withdrawal completed successfully',
          transaction: result,
        });
      } catch (error) {
        fastify.log.error('Withdrawal error:', error);
        reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to process withdrawal',
        });
      }
    }
  );

  // Create transfer transaction
  fastify.post(
    '/transfer',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Transfer funds between accounts',
        tags: ['Transactions'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['fromAccountId', 'toAccountId', 'amount', 'description'],
          properties: {
            fromAccountId: { type: 'string' },
            toAccountId: { type: 'string' },
            amount: { type: 'number', minimum: 0.01 },
            currency: { type: 'string', default: 'USD' },
            description: { type: 'string', minLength: 1 },
            reference: { type: 'string' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              transactions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    type: { type: 'string' },
                    amount: { type: 'number' },
                    currency: { type: 'string' },
                    status: { type: 'string' },
                    description: { type: 'string' },
                    reference: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const validatedData = transferSchema.parse(request.body);
        const { fromAccountId, toAccountId, amount, currency, description, reference } =
          validatedData;

        if (fromAccountId === toAccountId) {
          return reply.status(400).send({
            error: 'Invalid Transfer',
            message: 'Cannot transfer to the same account',
          });
        }

        // Verify source account ownership and balance
        const fromAccount = await prisma.account.findFirst({
          where: {
            id: fromAccountId,
            userId: user.userId,
            status: 'ACTIVE',
          },
        });

        if (!fromAccount) {
          return reply.status(404).send({
            error: 'Source Account Not Found',
            message: 'Source account not found, inactive, or access denied',
          });
        }

        if (Number(fromAccount.balance) < amount) {
          return reply.status(400).send({
            error: 'Insufficient Funds',
            message: 'Source account balance is insufficient for this transfer',
          });
        }

        // Verify destination account exists
        const toAccount = await prisma.account.findFirst({
          where: {
            id: toAccountId,
            status: 'ACTIVE',
          },
        });

        if (!toAccount) {
          return reply.status(404).send({
            error: 'Destination Account Not Found',
            message: 'Destination account not found or inactive',
          });
        }

        const transferRef = reference || `TRF-${Date.now()}`;

        // Create transfer transactions
        const result = await prisma.$transaction(async (tx: any) => {
          // Debit from source account
          const debitTransaction = await tx.transaction.create({
            data: {
              accountId: fromAccountId,
              type: 'TRANSFER',
              amount: -amount, // Negative for debit
              currency,
              status: 'COMPLETED',
              description: `Transfer to ${toAccount.accountNumber}: ${description}`,
              reference: transferRef,
            },
          });

          // Credit to destination account
          const creditTransaction = await tx.transaction.create({
            data: {
              accountId: toAccountId,
              type: 'TRANSFER',
              amount: amount, // Positive for credit
              currency,
              status: 'COMPLETED',
              description: `Transfer from ${fromAccount.accountNumber}: ${description}`,
              reference: transferRef,
            },
          });

          // Update account balances
          await tx.account.update({
            where: { id: fromAccountId },
            data: { balance: { decrement: amount } },
          });

          await tx.account.update({
            where: { id: toAccountId },
            data: { balance: { increment: amount } },
          });

          return [debitTransaction, creditTransaction];
        });

        reply.status(201).send({
          message: 'Transfer completed successfully',
          transactions: result,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Validation Error',
            message: error.errors.map(e => e.message).join(', '),
          });
        }

        fastify.log.error('Transfer error:', error);
        reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to process transfer',
        });
      }
    }
  );

  // Get transaction statistics
  fastify.get(
    '/stats',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get transaction statistics for the user',
        tags: ['Transactions'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            period: { type: 'string', enum: ['week', 'month', 'year'], default: 'month' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              totalTransactions: { type: 'integer' },
              totalAmount: { type: 'number' },
              deposits: { type: 'number' },
              withdrawals: { type: 'number' },
              transfers: { type: 'number' },
              byType: {
                type: 'object',
                properties: {
                  DEPOSIT: { type: 'integer' },
                  WITHDRAWAL: { type: 'integer' },
                  TRANSFER: { type: 'integer' },
                  PAYMENT: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const { period = 'month' } = request.query as any;

        // Calculate date range
        const now = new Date();
        const startDate = new Date();

        switch (period) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          default: // month
            startDate.setMonth(now.getMonth() - 1);
        }

        // Get user's account IDs
        const userAccounts = await prisma.account.findMany({
          where: { userId: user.userId },
          select: { id: true },
        });

        const accountIds = userAccounts.map((acc: any) => acc.id);

        if (accountIds.length === 0) {
          return reply.send({
            totalTransactions: 0,
            totalAmount: 0,
            deposits: 0,
            withdrawals: 0,
            transfers: 0,
            byType: { DEPOSIT: 0, WITHDRAWAL: 0, TRANSFER: 0, PAYMENT: 0 },
          });
        }

        const where = {
          accountId: { in: accountIds },
          createdAt: { gte: startDate },
          status: 'COMPLETED',
        };

        const [stats, typeStats] = await Promise.all([
          prisma.transaction.aggregate({
            where,
            _count: { id: true },
            _sum: { amount: true },
          }),
          prisma.transaction.groupBy({
            by: ['type'],
            where,
            _count: { id: true },
            _sum: { amount: true },
          }),
        ]);

        const byType = { DEPOSIT: 0, WITHDRAWAL: 0, TRANSFER: 0, PAYMENT: 0 };
        let deposits = 0,
          withdrawals = 0,
          transfers = 0;

        typeStats.forEach((stat: any) => {
          byType[stat.type as keyof typeof byType] = stat._count.id;
          const amount = stat._sum.amount || 0;

          switch (stat.type) {
            case 'DEPOSIT':
              deposits += amount;
              break;
            case 'WITHDRAWAL':
              withdrawals += Math.abs(amount);
              break;
            case 'TRANSFER':
              transfers += Math.abs(amount);
              break;
          }
        });

        reply.send({
          totalTransactions: stats._count.id,
          totalAmount: stats._sum.amount || 0,
          deposits,
          withdrawals,
          transfers,
          byType,
        });
      } catch (error) {
        fastify.log.error('Get transaction stats error:', error);
        reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to fetch transaction statistics',
        });
      }
    }
  );
}

// Named exports for individual route handlers
export const getTransactions = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const {
      page = 1,
      limit = 20,
      accountId,
      type,
      status,
      category,
      startDate,
      endDate,
    } = request.query as any;

    // Get user's account IDs
    const userAccounts = await prisma.account.findMany({
      where: { userId: user.userId },
      select: { id: true },
    });

    const accountIds = userAccounts.map((acc: any) => acc.id);

    if (accountIds.length === 0) {
      return reply.send({
        transactions: [],
        pagination: { page, limit, total: 0, pages: 0 },
      });
    }

    const where: any = {
      accountId: { in: accountId ? [accountId] : accountIds },
    };

    if (type) where.type = type;
    if (status) where.status = status;
    if (category) where.category = category;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: {
              accountNumber: true,
              accountType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    reply.send({
      transactions,
      pagination: { page, limit, total, pages },
    });
  } catch (error) {
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to fetch transactions',
    });
  }
};

export const getTransaction = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const { transactionId } = request.params as { transactionId: string };

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        account: { userId: user.userId },
      },
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true,
          },
        },
      },
    });

    if (!transaction) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Transaction not found',
      });
    }

    reply.send({ transaction });
  } catch (error) {
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to fetch transaction',
    });
  }
};

export const createDeposit = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const { accountId, amount, description, category } = request.body as any;

    // Verify account ownership
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.userId },
    });

    if (!account) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Account not found',
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        type: 'DEPOSIT',
        amount,
        currency: 'USD',
        status: 'COMPLETED',
        description,
        category: category || 'DEPOSIT',
        reference: `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        processedAt: new Date(),
      },
    });

    // Update account balance
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: { increment: amount } },
    });

    reply.status(201).send({
      message: 'Deposit completed successfully',
      transaction,
    });
  } catch (error) {
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to process deposit',
    });
  }
};

export const createWithdrawal = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const { accountId, amount, description, category } = request.body as any;

    // Verify account ownership and sufficient balance
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.userId },
    });

    if (!account) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Account not found',
      });
    }

    if (account.balance < amount) {
      return reply.status(400).send({
        error: 'Insufficient Funds',
        message: 'Account balance is insufficient for this withdrawal',
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        type: 'WITHDRAWAL',
        amount: -amount, // Negative for withdrawal
        currency: 'USD',
        status: 'COMPLETED',
        description,
        category: category || 'WITHDRAWAL',
        reference: `WTH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        processedAt: new Date(),
      },
    });

    // Update account balance
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: { decrement: amount } },
    });

    reply.status(201).send({
      message: 'Withdrawal completed successfully',
      transaction,
    });
  } catch (error) {
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to process withdrawal',
    });
  }
};

export const createTransfer = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const transferData = transferSchema.parse(request.body);
    const { fromAccountId, toAccountId, amount, description, category } = transferData;

    // Verify source account ownership
    const fromAccount = await prisma.account.findFirst({
      where: { id: fromAccountId, userId: user.userId },
    });

    if (!fromAccount) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Source account not found',
      });
    }

    // Verify destination account exists
    const toAccount = await prisma.account.findUnique({
      where: { id: toAccountId },
    });

    if (!toAccount) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Destination account not found',
      });
    }

    // Check sufficient balance
    if (Number(fromAccount.balance) < amount) {
      return reply.status(400).send({
        error: 'Insufficient Funds',
        message: 'Source account balance is insufficient for this transfer',
      });
    }

    // Create transfer transactions
    const reference = `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = await prisma.$transaction(async tx => {
      const debitTransaction = await tx.transaction.create({
        data: {
          accountId: fromAccountId,
          type: 'TRANSFER',
          amount: -amount,
          currency: 'USD',
          status: 'COMPLETED',
          description: `Transfer to ${toAccount.accountNumber}: ${description}`,
          category: category || 'TRANSFER',
          reference,
          processedAt: new Date(),
        },
      });

      const creditTransaction = await tx.transaction.create({
        data: {
          accountId: toAccountId,
          type: 'TRANSFER',
          amount: amount,
          currency: 'USD',
          status: 'COMPLETED',
          description: `Transfer from ${fromAccount.accountNumber}: ${description}`,
          category: category || 'TRANSFER',
          reference,
          processedAt: new Date(),
        },
      });

      // Update account balances
      await tx.account.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: amount } },
      });

      await tx.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } },
      });

      return [debitTransaction, creditTransaction];
    });

    reply.status(201).send({
      message: 'Transfer completed successfully',
      transactions: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.errors.map(e => e.message).join(', '),
      });
    }

    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to process transfer',
    });
  }
};

export const getTransactionStatistics = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const { period = 'month' } = request.query as any;

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // month
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get user's account IDs
    const userAccounts = await prisma.account.findMany({
      where: { userId: user.userId },
      select: { id: true },
    });

    const accountIds = userAccounts.map((acc: any) => acc.id);

    if (accountIds.length === 0) {
      return reply.send({
        totalTransactions: 0,
        totalAmount: 0,
        deposits: 0,
        withdrawals: 0,
        transfers: 0,
        byType: { DEPOSIT: 0, WITHDRAWAL: 0, TRANSFER: 0, PAYMENT: 0 },
      });
    }

    const where = {
      accountId: { in: accountIds },
      createdAt: { gte: startDate },
      status: 'COMPLETED',
    };

    const [stats, typeStats] = await Promise.all([
      prisma.transaction.aggregate({
        where,
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ['type'],
        where,
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    const byType = { DEPOSIT: 0, WITHDRAWAL: 0, TRANSFER: 0, PAYMENT: 0 };
    let deposits = 0,
      withdrawals = 0,
      transfers = 0;

    typeStats.forEach((stat: any) => {
      byType[stat.type as keyof typeof byType] = stat._count.id;
      const amount = stat._sum.amount || 0;

      switch (stat.type) {
        case 'DEPOSIT':
          deposits += amount;
          break;
        case 'WITHDRAWAL':
          withdrawals += Math.abs(amount);
          break;
        case 'TRANSFER':
          transfers += Math.abs(amount);
          break;
      }
    });

    reply.send({
      totalTransactions: stats._count.id,
      totalAmount: stats._sum.amount || 0,
      deposits,
      withdrawals,
      transfers,
      byType,
    });
  } catch (error) {
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to fetch transaction statistics',
    });
  }
};

export const updateTransactionCategory = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const { transactionId } = request.params as { transactionId: string };
    const { category } = request.body as { category: string };

    if (!category) {
      return reply.status(400).send({ error: 'Validation Error', message: 'Category is required' });
    }

    // Verify ownership
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        account: { userId: user.userId }
      }
    });

    if (!transaction) {
      return reply.status(404).send({ error: 'Not Found', message: 'Transaction not found' });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { category }
    });

    reply.send({ message: 'Category updated', transaction: updatedTransaction });
  } catch (error) {
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to update transaction category',
    });
  }
};
