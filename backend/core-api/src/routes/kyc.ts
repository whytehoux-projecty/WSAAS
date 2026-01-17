import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { z } from 'zod';
import { KycService } from '../services';
import { validationSchemas, HTTP_STATUS, ERROR_CODES } from '@shared/index';

/**
 * Get all KYC documents for a user
 */
export const getKYCDocuments = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request as any).user?.userId;

    if (!userId) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: ERROR_CODES.TOKEN_INVALID,
        message: 'Authentication required',
      });
    }

    const documents = await KycService.getUserDocuments(userId);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: documents,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to fetch KYC documents',
    });
  }
};

/**
 * Upload a new KYC document
 */
export const uploadKYCDocument = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request as any).user?.userId;
    const documentData = validationSchemas.createKYCDocument.parse(request.body);

    if (!userId) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: ERROR_CODES.TOKEN_INVALID,
        message: 'Authentication required',
      });
    }

    const document = await KycService.uploadDocument(userId, {
      documentType: documentData.type,
      fileName: documentData.fileName,
      filePath: documentData.filePath,
      fileSize: documentData.fileSize,
      mimeType: documentData.mimeType,
      fileBuffer: Buffer.from(''), // This should come from actual file upload
    });

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      data: document,
      message: 'KYC document uploaded successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: ERROR_CODES.VALIDATION_FAILED,
        message: 'Invalid document data',
        details: error.errors,
      });
    }

    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to upload KYC document',
    });
  }
};

/**
 * Get KYC document by ID
 */
export const getKYCDocument = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request as any).user?.userId;
    const { documentId } = request.params as { documentId: string };

    if (!userId) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: ERROR_CODES.TOKEN_INVALID,
        message: 'Authentication required',
      });
    }

    const document = await KycService.getDocumentById(documentId, userId);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: document,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to fetch KYC document',
    });
  }
};

/**
 * Delete KYC document
 */
export const deleteKYCDocument = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request as any).user?.userId;
    const { documentId } = request.params as { documentId: string };

    if (!userId) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: ERROR_CODES.TOKEN_INVALID,
        message: 'Authentication required',
      });
    }

    await KycService.deleteDocument(documentId, userId);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      message: 'KYC document deleted successfully',
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to delete KYC document',
    });
  }
};

/**
 * Get KYC status for user
 */
export const getKYCStatus = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request as any).user?.userId;

    if (!userId) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: ERROR_CODES.TOKEN_INVALID,
        message: 'Authentication required',
      });
    }

    const kycStatus = await KycService.getKycStatus(userId);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: kycStatus,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to fetch KYC status',
    });
  }
};

/**
 * Get KYC next steps for user
 */
export const getKYCNextSteps = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request as any).user?.userId;

    if (!userId) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: ERROR_CODES.TOKEN_INVALID,
        message: 'Authentication required',
      });
    }

    const nextSteps = await KycService.getKycNextSteps(userId);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: nextSteps,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to fetch KYC next steps',
    });
  }
};

// Default export function to register routes
export default async function kycRoutes(fastify: FastifyInstance) {
  // Get KYC documents for a user
  fastify.get('/:userId/documents', {
    preHandler: [fastify.authenticate],
    handler: getKYCDocuments,
  });

  // Upload KYC document
  fastify.post('/:userId/documents', {
    preHandler: [fastify.authenticate],
    handler: uploadKYCDocument,
  });

  // Get specific KYC document
  fastify.get('/:userId/documents/:documentId', {
    preHandler: [fastify.authenticate],
    handler: getKYCDocument,
  });

  // Delete KYC document
  fastify.delete('/:userId/documents/:documentId', {
    preHandler: [fastify.authenticate],
    handler: deleteKYCDocument,
  });

  // Get KYC status for a user
  fastify.get('/:userId/status', {
    preHandler: [fastify.authenticate],
    handler: getKYCStatus,
  });

  // Get KYC next steps for a user
  fastify.get('/:userId/next-steps', {
    preHandler: [fastify.authenticate],
    handler: getKYCNextSteps,
  });
}
