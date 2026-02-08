
import Fastify, { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

// Virtual mock for @shared/index to bypass resolution issues
jest.mock('@shared/index', () => ({
    validationSchemas: {
        userQuery: { parse: jest.fn((q) => q) },
        adminCreateUser: { parse: jest.fn((b) => b) },
        updateUser: { parse: jest.fn((b) => b) },
        statisticsQuery: { parse: jest.fn((q) => q) },
    },
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        CONFLICT: 409,
        INTERNAL_SERVER_ERROR: 500,
    },
    ERROR_CODES: {
        VALIDATION_FAILED: 'VALIDATION_FAILED',
        INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
        ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
    },
}), { virtual: true });

import userRoutes from '../../src/routes/users';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(true),
}));

// Mock Prisma
jest.mock('@prisma/client', () => {
    const mPrisma: any = {
        user: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        auditLog: {
            create: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrisma),
        Prisma: {
            Decimal: jest.fn(val => val),
        },
    };
});

describe('User Integration Tests', () => {
    let app: FastifyInstance;
    const mockPrisma = new PrismaClient() as any;

    beforeAll(async () => {
        app = Fastify();

        // Mock Authentication Middleware
        app.decorate('authenticate', async (req: any, _reply: any) => {
            req.user = { userId: 'admin-123', role: 'admin' };
        });

        // Register Routes
        await app.register(userRoutes);
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /', () => {
        it('should return paginated users', async () => {
            mockPrisma.user.findMany.mockResolvedValue([
                { id: 'user-1', email: 'test@example.com', firstName: 'John' }
            ]);
            mockPrisma.user.count.mockResolvedValue(1);

            const response = await app.inject({
                method: 'GET',
                url: '/?page=1&limit=10',
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.data).toHaveLength(1);
        });
    });

    describe('GET /:id', () => {
        it('should return user details', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });

            const response = await app.inject({
                method: 'GET',
                url: '/user-1'
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.data.id).toBe('user-1');
        });

        it('should return 404 if user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const response = await app.inject({
                method: 'GET',
                url: '/user-999'
            });

            expect(response.statusCode).toBe(404);
        });
    });


    describe('POST /:id/suspend', () => {
        it('should suspend user', async () => {
            mockPrisma.user.update.mockResolvedValue({ id: 'user-1', status: 'SUSPENDED' });

            const response = await app.inject({
                method: 'POST',
                url: '/user-1/suspend'
            });

            expect(response.statusCode).toBe(200);
            expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'user-1' },
                data: { status: 'SUSPENDED' }
            }));
            expect(mockPrisma.auditLog.create).toHaveBeenCalled();
        });
    });

    describe('POST /:id/activate', () => {
        it('should activate user', async () => {
            mockPrisma.user.update.mockResolvedValue({ id: 'user-1', status: 'ACTIVE' });

            const response = await app.inject({
                method: 'POST',
                url: '/user-1/activate'
            });

            expect(response.statusCode).toBe(200);
            expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'user-1' },
                data: { status: 'ACTIVE' }
            }));
            expect(mockPrisma.auditLog.create).toHaveBeenCalled();
        });
    });
});
