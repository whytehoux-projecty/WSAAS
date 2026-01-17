import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { z } from 'zod';
import { WireTransferService } from '../services';
import { validationSchemas, HTTP_STATUS, ERROR_CODES } from '@shared/index';

/**
 * Get all wire transfers for a user
 */
export const getWireTransfers = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request as any).user?.userId;
    const query = validationSchemas.wireTransferQuery.parse(request.query);

    if (!userId) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: ERROR_CODES.TOKEN_INVALID,
        message: 'Authentication required',
      });
    }

    const { page = 1, limit = 10, status } = query;
    const result = await WireTransferService.getUserWireTransfers(userId, {
      page,
      limit,
      ...(status && { status }),
    });

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: result.wireTransfers,
      pagination: result.pagination,
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
      message: 'Failed to fetch wire transfers',
    });
  }
};

/**
 * Get wire transfer by ID
 */
export const getWireTransfer = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request as any).user?.userId;
    const { wireTransferId } = request.params as { wireTransferId: string };

    if (!userId) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: ERROR_CODES.TOKEN_INVALID,
        message: 'Authentication required',
      });
    }

    const wireTransfer = await WireTransferService.getWireTransferById(wireTransferId, userId);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: wireTransfer,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to fetch wire transfer',
    });
  }
};

/**
 * Create a new wire transfer
 */
export const createWireTransfer = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request as any).user?.userId;
    const wireTransferData = validationSchemas.createWireTransfer.parse(request.body);

    if (!userId) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: ERROR_CODES.TOKEN_INVALID,
        message: 'Authentication required',
      });
    }

    // Map validation schema properties to service expected properties
    const mappedData = {
      senderAccountId: wireTransferData.fromAccountId,
      amount: wireTransferData.amount,
      currency: wireTransferData.currency,
      recipientName: wireTransferData.recipientName,
      recipientBankName: wireTransferData.recipientBank,
      recipientAccountNumber: wireTransferData.recipientAccount,
      purposeCode: wireTransferData.purpose,
      ...(wireTransferData.swiftCode && { recipientBankSwift: wireTransferData.swiftCode }),
    };

    const result = await WireTransferService.createWireTransfer(userId, mappedData);

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      data: result.wireTransfer,
      message: 'Wire transfer initiated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: ERROR_CODES.VALIDATION_FAILED,
        message: 'Invalid wire transfer data',
        details: error.errors,
      });
    }

    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to create wire transfer',
    });
  }
};

/**
 * Cancel a wire transfer
 */
export const cancelWireTransfer = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request as any).user?.userId;
    const { wireTransferId } = request.params as { wireTransferId: string };

    if (!userId) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: ERROR_CODES.TOKEN_INVALID,
        message: 'Authentication required',
      });
    }

    await WireTransferService.cancelWireTransfer(wireTransferId, userId);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      message: 'Wire transfer cancelled successfully',
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to cancel wire transfer',
    });
  }
};

/**
 * Get wire transfer fees
 */
export const getWireTransferFees = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { amount, currency } = request.query as { amount: string; currency?: string };

    if (!amount || isNaN(Number(amount))) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: ERROR_CODES.VALIDATION_FAILED,
        message: 'Valid amount is required',
      });
    }

    const fee = await WireTransferService.calculateWireTransferFee(Number(amount), currency);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: {
        amount: Number(amount),
        currency: currency || 'USD',
        fee,
        total: Number(amount) + fee,
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to calculate wire transfer fees',
    });
  }
};

/**
 * Generate wire transfer reference
 */
export const generateWireTransferReference = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const reference = WireTransferService.generateWireTransferReference();

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: { reference },
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to generate reference',
    });
  }
};

// Default export function to register routes
export default async function wireTransferRoutes(fastify: FastifyInstance) {
  // Get all wire transfers for a user
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    handler: getWireTransfers,
  });

  // Get specific wire transfer
  fastify.get('/:wireTransferId', {
    preHandler: [fastify.authenticate],
    handler: getWireTransfer,
  });

  // Create new wire transfer
  fastify.post('/', {
    preHandler: [fastify.authenticate],
    handler: createWireTransfer,
  });

  // Cancel wire transfer
  fastify.patch('/:wireTransferId/cancel', {
    preHandler: [fastify.authenticate],
    handler: cancelWireTransfer,
  });

  // Get wire transfer fees
  fastify.get('/fees/calculate', {
    handler: getWireTransferFees,
  });

  // Generate wire transfer reference
  fastify.get('/reference/generate', {
    handler: generateWireTransferReference,
  });
}
