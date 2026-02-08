import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { TransactionService } from '../services/transactionService';
import { ERROR_CODES, HTTP_STATUS } from '../../../shared/index';

const prisma = new PrismaClient();

// Validation schemas
const transferSchema = z.object({
  fromAccountId: z.string(),
  toAccountId: z.string().optional(),
  toAccountNumber: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  description: z.string().min(1),
  reference: z.string().optional(),
  category: z.string().optional(),
}).refine((data) => data.toAccountId || data.toAccountNumber, {
  message: "Either toAccountId or toAccountNumber must be provided",
  path: ["toAccountId"],
});

// Helper to handle service errors
const handleServiceError = (error: any, reply: FastifyReply) => {
  const message = error.message || 'An unexpected error occurred';

  // Map service errors to HTTP status codes
  if (message.includes('not found')) {
    return reply.status(HTTP_STATUS.NOT_FOUND).send({
      error: ERROR_CODES.RESOURCE_NOT_FOUND,
      message
    });
  }

  if (message.includes('Insufficient funds') || message.includes('limit exceeded')) {
    return reply.status(HTTP_STATUS.BAD_REQUEST).send({
      error: ERROR_CODES.INSUFFICIENT_FUNDS, // or DAILY_LIMIT_EXCEEDED based on message
      message
    });
  }

  if (message.includes('Minimum') || message.includes('Maximum')) {
    return reply.status(HTTP_STATUS.BAD_REQUEST).send({
      error: ERROR_CODES.VALUE_OUT_OF_RANGE,
      message
    });
  }

  // Default to 500
  return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
    error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    message
  });
};

export const getTransactions = async (request: FastifyRequest, reply: FastifyReply) => {
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

    const queryOptions: any = {
      page: Number(page),
      limit: Number(limit),
    };

    // Filter undefined values because exactOptionalPropertyTypes is enabled
    if (accountId) queryOptions.accountId = accountId;
    if (type) queryOptions.type = type;
    if (status) queryOptions.status = status;
    if (startDate) queryOptions.startDate = new Date(startDate);
    if (endDate) queryOptions.endDate = new Date(endDate);

    const result = await TransactionService.getUserTransactions(user.userId, queryOptions);

    reply.send(result);
  } catch (error) {
    handleServiceError(error, reply);
  }
};

export const getTransaction = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const { transactionId } = request.params as { transactionId: string };

    const transaction = await TransactionService.getTransactionById(transactionId, user.userId);

    reply.send({ transaction });
  } catch (error) {
    handleServiceError(error, reply);
  }
};

export const createDeposit = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const { accountId, amount, currency, description, reference } = request.body as any;

    const transaction = await TransactionService.createDeposit(user.userId, {
      accountId,
      amount,
      currency,
      description,
      reference
    });

    reply.status(HTTP_STATUS.CREATED).send({
      message: 'Deposit completed successfully',
      transaction,
    });
  } catch (error) {
    handleServiceError(error, reply);
  }
};

export const createWithdrawal = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const { accountId, amount, currency, description, reference } = request.body as any;

    const transaction = await TransactionService.createWithdrawal(user.userId, {
      accountId,
      amount,
      currency,
      description,
      reference
    });

    reply.status(HTTP_STATUS.CREATED).send({
      message: 'Withdrawal completed successfully',
      transaction,
    });
  } catch (error) {
    handleServiceError(error, reply);
  }
};

export const createTransfer = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const validatedData = transferSchema.parse(request.body);
    const { fromAccountId, toAccountId, toAccountNumber, amount, currency, description, reference } = validatedData;

    const transferPayload: any = {
      fromAccountId,
      toAccountId,
      toAccountNumber,
      amount,
      description: description || 'Transfer',
    };
    if (currency) transferPayload.currency = currency;
    if (reference) transferPayload.reference = reference;

    const transactions = await TransactionService.createTransfer(user.userId, transferPayload);

    reply.status(HTTP_STATUS.CREATED).send({
      message: 'Transfer completed successfully',
      transactions,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        error: ERROR_CODES.VALIDATION_FAILED,
        message: error.errors.map(e => e.message).join(', '),
      });
    }
    handleServiceError(error, reply);
  }
};

export const getTransactionStatistics = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const { period = 'month' } = request.query as any;

    const stats = await TransactionService.getTransactionStats(user.userId, period);

    reply.send(stats);
  } catch (error) {
    handleServiceError(error, reply);
  }
};

export const updateTransactionCategory = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const { transactionId } = request.params as { transactionId: string };
    const { category } = request.body as { category: string };

    if (!category) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        error: ERROR_CODES.VALIDATION_FAILED,
        message: 'Category is required'
      });
    }

    // Verify ownership
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        account: { userId: user.userId }
      }
    });

    if (!transaction) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        error: ERROR_CODES.TRANSACTION_NOT_FOUND,
        message: 'Transaction not found'
      });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { category }
    });

    reply.send({ message: 'Category updated', transaction: updatedTransaction });
  } catch (error) {
    request.log.error(error);
    reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to update transaction category',
    });
  }
};

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
      },
      handler: getTransactions
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
      },
      handler: getTransaction
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
      },
      handler: createDeposit
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
      },
      handler: createWithdrawal
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
          required: ['fromAccountId', 'amount', 'description'],
          properties: {
            fromAccountId: { type: 'string' },
            toAccountId: { type: 'string' },
            toAccountNumber: { type: 'string' },
            amount: { type: 'number', minimum: 0.01 },
            currency: { type: 'string', default: 'USD' },
            description: { type: 'string', minLength: 1 },
            reference: { type: 'string' },
          },
        },
      },
      handler: createTransfer
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
      },
      handler: getTransactionStatistics
    }
  );

  // Update transaction category
  fastify.patch(
    '/:transactionId/category',
    {
      preHandler: [fastify.authenticate],
    },
    updateTransactionCategory
  );
}
