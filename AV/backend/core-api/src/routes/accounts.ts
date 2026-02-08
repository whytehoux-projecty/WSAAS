import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AccountService } from '../services/accountService';
import { ERROR_CODES, HTTP_STATUS } from '../../shared/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation schemas
const createAccountSchema = z.object({
  accountType: z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT', 'CREDIT']),
  currency: z.string().default('USD'),
  initialDeposit: z.number().min(0).optional(),
});

const updateAccountSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'CLOSED']).optional(),
  dailyLimit: z.number().min(0).optional(),
  monthlyLimit: z.number().min(0).optional(),
});

export default async function accountRoutes(fastify: FastifyInstance) {
  // Get user accounts
  fastify.get(
    '/',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get all accounts for the authenticated user',
        tags: ['Accounts'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              accounts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    accountNumber: { type: 'string' },
                    accountType: { type: 'string' },
                    balance: { type: 'number' },
                    currency: { type: 'string' },
                    status: { type: 'string' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
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
        const accounts = await AccountService.getUserAccounts(user.userId);
        reply.send({ accounts });
      } catch (error) {
        request.log.error('Get accounts error:', error);
        reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to fetch accounts',
        });
      }
    }
  );

  // Get specific account
  fastify.get(
    '/:accountId',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get specific account details',
        tags: ['Accounts'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            accountId: { type: 'string' },
          },
          required: ['accountId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              account: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  accountNumber: { type: 'string' },
                  accountType: { type: 'string' },
                  balance: { type: 'number' },
                  currency: { type: 'string' },
                  status: { type: 'string' },
                  dailyLimit: { type: 'number' },
                  monthlyLimit: { type: 'number' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
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
        const { accountId } = request.params as { accountId: string };
        const account = await AccountService.getAccountById(accountId, user.userId);
        reply.send({ account });
      } catch (error: any) {
        if (error.message === ERROR_CODES.ACCOUNT_NOT_FOUND) {
          return reply.status(HTTP_STATUS.NOT_FOUND).send({
            error: 'Account Not Found',
            message: 'Account not found or access denied',
          });
        }
        request.log.error('Get account error:', error);
        reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to fetch account',
        });
      }
    }
  );

  // Create new account
  fastify.post(
    '/',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Create a new account',
        tags: ['Accounts'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['accountType'],
          properties: {
            accountType: {
              type: 'string',
              enum: ['CHECKING', 'SAVINGS', 'INVESTMENT', 'CREDIT'],
            },
            currency: { type: 'string', default: 'USD' },
            initialDeposit: { type: 'number', minimum: 0 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              account: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  accountNumber: { type: 'string' },
                  accountType: { type: 'string' },
                  balance: { type: 'number' },
                  currency: { type: 'string' },
                  status: { type: 'string' },
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
        const validatedData = createAccountSchema.parse(request.body);

        const createOptions: any = {
          accountType: validatedData.accountType as any
        };
        if (validatedData.initialDeposit !== undefined) {
          createOptions.initialDeposit = validatedData.initialDeposit;
        }

        const account = await AccountService.createAccount(user.userId, createOptions);

        reply.status(201).send({
          message: 'Account created successfully',
          account,
        });
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Validation Error',
            message: error.errors.map(e => e.message).join(', '),
          });
        }

        if (error.message === ERROR_CODES.USER_NOT_FOUND) {
          return reply.status(HTTP_STATUS.NOT_FOUND).send({
            error: 'User Not Found',
            message: 'User does not exist'
          });
        }

        request.log.error('Create account error:', error);
        reply.status(500).send({
          error: 'Internal Server Error',
          message: error.message || 'Failed to create account',
        });
      }
    }
  );

  // Update account
  fastify.patch(
    '/:accountId',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Update account settings',
        tags: ['Accounts'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            accountId: { type: 'string' },
          },
          required: ['accountId'],
        },
        body: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['ACTIVE', 'SUSPENDED', 'CLOSED'],
            },
            dailyLimit: { type: 'number', minimum: 0 },
            monthlyLimit: { type: 'number', minimum: 0 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              account: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  status: { type: 'string' },
                  dailyLimit: { type: 'number' },
                  monthlyLimit: { type: 'number' },
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
        const { accountId } = request.params as { accountId: string };
        const validatedData = updateAccountSchema.parse(request.body);

        const updatedAccount = await AccountService.updateAccount(
          accountId,
          user.userId,
          validatedData as any
        );

        reply.send({
          message: 'Account updated successfully',
          account: updatedAccount,
        });
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Validation Error',
            message: error.errors.map(e => e.message).join(', '),
          });
        }

        if (error.message === ERROR_CODES.ACCOUNT_NOT_FOUND) {
          return reply.status(HTTP_STATUS.NOT_FOUND).send({
            error: 'Account Not Found',
            message: 'Account not found or access denied',
          });
        }

        request.log.error('Update account error:', error);
        reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to update account',
        });
      }
    }
  );

  // Get account balance
  fastify.get(
    '/:accountId/balance',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get account balance',
        tags: ['Accounts'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            accountId: { type: 'string' },
          },
          required: ['accountId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              balance: { type: 'number' },
              currency: { type: 'string' },
              availableBalance: { type: 'number' },
              pendingTransactions: { type: 'number' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const { accountId } = request.params as { accountId: string };

        const balanceData = await AccountService.getAccountBalance(accountId, user.userId);

        reply.send(balanceData);
      } catch (error: any) {
        if (error.message === ERROR_CODES.ACCOUNT_NOT_FOUND) {
          return reply.status(HTTP_STATUS.NOT_FOUND).send({
            error: 'Account Not Found',
            message: 'Account not found or access denied',
          });
        }

        request.log.error('Get balance error:', error);
        reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to fetch balance',
        });
      }
    }
  );

  // Get account transactions
  fastify.get(
    '/:accountId/transactions',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get account transaction history',
        tags: ['Accounts'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            accountId: { type: 'string' },
          },
          required: ['accountId'],
        },
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            type: { type: 'string' },
            status: { type: 'string' },
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
        const { accountId } = request.params as { accountId: string };
        const { page = 1, limit = 20, type, status } = request.query as any;

        const result = await AccountService.getAccountTransactions(accountId, user.userId, {
          page: Number(page),
          limit: Number(limit),
          type: type || undefined,
          status: status || undefined
        });

        reply.send(result);
      } catch (error: any) {
        if (error.message === ERROR_CODES.ACCOUNT_NOT_FOUND) {
          return reply.status(HTTP_STATUS.NOT_FOUND).send({
            error: 'Account Not Found',
            message: 'Account not found or access denied',
          });
        }

        request.log.error('Get transactions error:', error);
        reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to fetch transactions',
        });
      }
    }
  );
}

// Named exports for individual route handlers
export const getAccounts = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;

    const accounts = await prisma.account.findMany({
      where: { userId: user.userId },
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        balance: true,
        currency: true,
        status: true,
        dailyLimit: true,
        monthlyLimit: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    reply.send({ accounts });
  } catch (error) {
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to fetch accounts',
    });
  }
};

export const getAccount = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const { accountId } = request.params as { accountId: string };

    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.userId,
      },
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        balance: true,
        currency: true,
        status: true,
        dailyLimit: true,
        monthlyLimit: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!account) {
      return reply.status(404).send({
        error: 'Account Not Found',
        message: 'Account not found or access denied',
      });
    }

    reply.send({ account });
  } catch (error) {
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to fetch account',
    });
  }
};

export const createAccount = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const accountData = createAccountSchema.parse(request.body);

    // Generate unique account number
    const accountNumber = `${accountData.accountType.substring(0, 3).toUpperCase()}${Date.now()}${Math.floor(
      Math.random() * 1000
    )
      .toString()
      .padStart(3, '0')}`;

    const account = await prisma.account.create({
      data: {
        userId: user.userId,
        accountNumber,
        accountType: accountData.accountType,
        currency: accountData.currency,
        balance: accountData.initialDeposit || 0,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        balance: true,
        currency: true,
        status: true,
        createdAt: true,
      },
    });

    // If there's an initial deposit, create a transaction record
    if (accountData.initialDeposit && accountData.initialDeposit > 0) {
      await prisma.transaction.create({
        data: {
          accountId: account.id,
          type: 'DEPOSIT',
          amount: accountData.initialDeposit,
          currency: accountData.currency,
          status: 'COMPLETED',
          description: 'Initial deposit',
          reference: `INIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          processedAt: new Date(),
        },
      });
    }

    reply.status(201).send({
      message: 'Account created successfully',
      account,
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
      message: 'Failed to create account',
    });
  }
};

export const updateAccount = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const { accountId } = request.params as { accountId: string };
    const updateData = updateAccountSchema.parse(request.body);

    // Verify account ownership
    const existingAccount = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.userId,
      },
    });

    if (!existingAccount) {
      return reply.status(404).send({
        error: 'Account Not Found',
        message: 'Account not found or access denied',
      });
    }

    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      // Avoid passing undefined properties to Prisma
      data: (() => {
        const data: any = {};
        if (updateData.status !== undefined) data.status = updateData.status;
        if (updateData.dailyLimit !== undefined) data.dailyLimit = updateData.dailyLimit;
        if (updateData.monthlyLimit !== undefined) data.monthlyLimit = updateData.monthlyLimit;
        return data;
      })(),
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        balance: true,
        currency: true,
        status: true,
        dailyLimit: true,
        monthlyLimit: true,
        updatedAt: true,
      },
    });

    reply.send({
      message: 'Account updated successfully',
      account: updatedAccount,
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
      message: 'Failed to update account',
    });
  }
};

export const getAccountBalance = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const { accountId } = request.params as { accountId: string };

    // Verify account ownership and get balance
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.userId,
      },
      select: {
        balance: true,
        currency: true,
      },
    });

    if (!account) {
      return reply.status(404).send({
        error: 'Account Not Found',
        message: 'Account not found or access denied',
      });
    }

    // Calculate pending transactions
    const pendingTransactions = await prisma.transaction.aggregate({
      where: {
        accountId,
        status: 'PENDING',
      },
      _sum: {
        amount: true,
      },
    });

    const pendingAmount = pendingTransactions._sum.amount ? Number(pendingTransactions._sum.amount) : 0;
    const availableBalance = Number(account.balance) - pendingAmount;

    reply.send({
      balance: Number(account.balance),
      currency: account.currency,
      availableBalance,
      pendingTransactions: pendingAmount,
    });
  } catch (error) {
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to fetch balance',
    });
  }
};

export const getAccountTransactions = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const { accountId } = request.params as { accountId: string };
    const { page = 1, limit = 20, type, status } = request.query as any;

    // Verify account ownership
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.userId,
      },
    });

    if (!account) {
      return reply.status(404).send({
        error: 'Account Not Found',
        message: 'Account not found or access denied',
      });
    }

    const where: any = { accountId };
    if (type) where.type = type;
    if (status) where.status = status;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        select: {
          id: true,
          type: true,
          amount: true,
          currency: true,
          status: true,
          description: true,
          reference: true,
          createdAt: true,
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
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to fetch transactions',
    });
  }
};
