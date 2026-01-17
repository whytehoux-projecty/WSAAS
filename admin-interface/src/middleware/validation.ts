import { FastifyRequest, FastifyReply } from "fastify";
import { ZodSchema, ZodError, z } from "zod";

export interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
  headers?: ZodSchema;
}

export function validateRequest(schemas: ValidationSchemas) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Validate request body
      if (schemas.body && request.body) {
        request.body = schemas.body.parse(request.body);
      }

      // Validate request parameters
      if (schemas.params && request.params) {
        request.params = schemas.params.parse(request.params);
      }

      // Validate query parameters
      if (schemas.query && request.query) {
        request.query = schemas.query.parse(request.query);
      }

      // Validate headers
      if (schemas.headers && request.headers) {
        request.headers = schemas.headers.parse(request.headers);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        request.log.warn(
          {
            error: error.errors,
            context: {
              requestId: request.id,
              path: request.url,
              method: request.method,
            },
          },
          "Request validation failed"
        );

        return reply.status(400).send({
          error: "Validation Error",
          message: "Invalid request data",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
          })),
          requestId: request.id,
        });
      }
      throw error;
    }
  };
}

// Common validation schemas
export const commonSchemas = {
  id: {
    params: z.object({
      id: z.string().uuid("Invalid ID format"),
    }),
  },
  pagination: {
    query: z.object({
      page: z.string().transform(Number).optional().default("1"),
      limit: z.string().transform(Number).optional().default("10"),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    }),
  },
};
