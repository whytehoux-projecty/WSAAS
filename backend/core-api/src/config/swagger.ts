export const swaggerConfig = {
  swagger: {
    info: {
      title: 'Aurum Vault Core API',
      description: `
# Aurum Vault Banking API

A comprehensive banking API providing secure financial services including account management, transactions, KYC verification, and more.

## Authentication

This API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Rate Limiting

- **General endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 10 requests per minute per IP
- **Transaction endpoints**: 50 requests per minute per user

## Error Handling

All errors follow a consistent format:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "uuid"
  }
}
\`\`\`

## Pagination

List endpoints support pagination with the following query parameters:

- \`page\`: Page number (default: 1)
- \`limit\`: Items per page (default: 20, max: 100)

Response includes pagination metadata:

\`\`\`json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
\`\`\`
      `,
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'api-support@aurumvault.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    host: 'localhost:3001',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Accounts',
        description: 'Bank account management operations',
      },
      {
        name: 'Transactions',
        description: 'Financial transaction operations',
      },
      {
        name: 'KYC',
        description: 'Know Your Customer verification processes',
      },
      {
        name: 'Users',
        description: 'User profile and management operations',
      },
      {
        name: 'Health',
        description: 'System health and monitoring endpoints',
      },
    ],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey' as const,
        name: 'Authorization',
        in: 'header' as const,
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
    },
    security: [{ Bearer: [] }],
  },
  exposeRoute: true,
};

export const swaggerUiConfig = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list' as const,
    deepLinking: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
  staticCSP: true,
  transformStaticCSP: (header: string) => header,
};

// Common schema definitions for reuse
export const commonSchemas = {
  Error: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string', example: 'Request validation failed' },
          details: { type: 'object' },
        },
      },
      meta: {
        type: 'object',
        properties: {
          timestamp: { type: 'string', format: 'date-time' },
          requestId: { type: 'string', format: 'uuid' },
        },
      },
    },
  },

  SuccessResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: { type: 'object' },
      meta: {
        type: 'object',
        properties: {
          timestamp: { type: 'string', format: 'date-time' },
          requestId: { type: 'string', format: 'uuid' },
        },
      },
    },
  },

  PaginationMeta: {
    type: 'object',
    properties: {
      pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 5 },
          hasNext: { type: 'boolean', example: true },
          hasPrev: { type: 'boolean', example: false },
        },
      },
    },
  },

  User: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      phoneNumber: { type: 'string' },
      dateOfBirth: { type: 'string', format: 'date' },
      isEmailVerified: { type: 'boolean' },
      isPhoneVerified: { type: 'boolean' },
      kycStatus: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  Account: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      accountNumber: { type: 'string' },
      accountType: { type: 'string', enum: ['SAVINGS', 'CHECKING', 'BUSINESS'] },
      balance: { type: 'number', format: 'decimal' },
      currency: { type: 'string', example: 'USD' },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'FROZEN', 'CLOSED'] },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  Transaction: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      type: { type: 'string', enum: ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT'] },
      amount: { type: 'number', format: 'decimal' },
      currency: { type: 'string', example: 'USD' },
      status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'] },
      description: { type: 'string' },
      reference: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
};
