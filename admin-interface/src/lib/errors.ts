import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export interface ErrorContext {
  requestId?: string;
  userId?: string;
  adminUserId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: ErrorContext;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: ErrorContext
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (context) {
      this.context = context;
    }
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 400, true, context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: ErrorContext) {
    super(message, 401, true, context);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context?: ErrorContext) {
    super(message, 403, true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', context?: ErrorContext) {
    super(message, 404, true, context);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 409, true, context);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', context?: ErrorContext) {
    super(message, 429, true, context);
  }
}

// Enhanced error handler
export function createErrorHandler() {
  return (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const context: ErrorContext = {
      requestId: request.id,
      ip: request.ip,
      path: request.url,
      method: request.method,
      ...(request.headers['user-agent'] && { userAgent: request.headers['user-agent'] }),
    };

    // Log error with context
    request.log.error({
      error: {
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
      },
      context,
    }, 'Request error');

    // Handle validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: error.validation,
        requestId: request.id,
      });
    }

    // Handle known application errors
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.constructor.name,
        message: error.message,
        requestId: request.id,
      });
    }

    // Handle Fastify errors
    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        error: error.name || 'Error',
        message: error.message,
        requestId: request.id,
      });
    }

    // Handle unknown errors
    const isDevelopment = process.env.NODE_ENV === 'development';
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: isDevelopment ? error.message : 'Something went wrong',
      requestId: request.id,
      ...(isDevelopment && { stack: error.stack }),
    });
  };
}