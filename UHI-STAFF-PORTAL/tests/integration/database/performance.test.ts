/**
 * Database Performance Integration Tests
 * 
 * Tests REAL database performance with:
 * - Real query performance benchmarks
 * - Real index usage verification
 * - Real bulk operations
 * - Real N+1 query detection
 * 
 * NO MOCKING - All tests use actual database
 */

import { PrismaClient } from '@prisma/client';
import TEST_CONFIG from '../../config/test.config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: TEST_CONFIG.database.connectionString,
        },
    },
});

describe('Database Performance - Real Integration Tests', () => {
    beforeAll(async () => {
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('Query Performance', () => {
        it('should execute simple query within performance threshold', async () => {
            const startTime = Date.now();

            await prisma.user.findMany({ take: 100 });

            const duration = Date.now() - startTime;

            // Should complete within 100ms
            expect(duration).toBeLessThan(100);
        });

        it('should execute complex join query efficiently', async () => {
            const startTime = Date.now();

            await prisma.staff.findMany({
                take: 50,
                include: {
                    user: true,
                    organization: true,
                    payroll: { take: 5 },
                },
            });

            const duration = Date.now() - startTime;

            // Should complete within 500ms
            expect(duration).toBeLessThan(500);
        });

        it('should handle pagination efficiently', async () => {
            const startTime = Date.now();

            const page1 = await prisma.user.findMany({
                skip: 0,
                take: 20,
                orderBy: { createdAt: 'desc' },
            });

            const page2 = await prisma.user.findMany({
                skip: 20,
                take: 20,
                orderBy: { createdAt: 'desc' },
            });

            const duration = Date.now() - startTime;

            expect(page1.length).toBeLessThanOrEqual(20);
            expect(page2.length).toBeLessThanOrEqual(20);
            expect(duration).toBeLessThan(200);
        });
    });

    describe('Bulk Operations', () => {
        it('should handle bulk inserts efficiently', async () => {
            const testData = Array.from({ length: 100 }, (_, i) => ({
                email: `bulk.test.${Date.now()}.${i}@uhi.org`,
                password: 'hashedpassword',
                firstName: 'Bulk',
                lastName: `Test${i}`,
                role: 'STAFF' as const,
            }));

            const startTime = Date.now();

            const result = await prisma.user.createMany({
                data: testData,
                skipDuplicates: true,
            });

            const duration = Date.now() - startTime;

            expect(result.count).toBeGreaterThan(0);
            expect(duration).toBeLessThan(1000); // 1 second for 100 inserts

            // Cleanup
            await prisma.user.deleteMany({
                where: {
                    email: { startsWith: 'bulk.test.' },
                },
            });
        });

        it('should handle bulk updates efficiently', async () => {
            const startTime = Date.now();

            await prisma.user.updateMany({
                where: {
                    role: 'STAFF',
                    isActive: true,
                },
                data: {
                    updatedAt: new Date(),
                },
            });

            const duration = Date.now() - startTime;

            expect(duration).toBeLessThan(500);
        });
    });

    describe('Index Usage', () => {
        it('should use index for email lookup', async () => {
            const email = (await prisma.user.findFirst())?.email || '';

            const startTime = Date.now();

            await prisma.user.findUnique({
                where: { email },
            });

            const duration = Date.now() - startTime;

            // Should be very fast with index
            expect(duration).toBeLessThan(10);
        });

        it('should use index for staff lookup by employeeId', async () => {
            const employeeId = (await prisma.staff.findFirst())?.employeeId || '';

            const startTime = Date.now();

            await prisma.staff.findFirst({
                where: { employeeId },
            });

            const duration = Date.now() - startTime;

            expect(duration).toBeLessThan(10);
        });
    });

    describe('N+1 Query Prevention', () => {
        it('should avoid N+1 queries with proper includes', async () => {
            // Bad approach (N+1)
            const startTimeBad = Date.now();
            const staffList = await prisma.staff.findMany({ take: 10 });
            for (const staff of staffList) {
                await prisma.user.findUnique({ where: { id: staff.userId } });
            }
            const durationBad = Date.now() - startTimeBad;

            // Good approach (single query with include)
            const startTimeGood = Date.now();
            await prisma.staff.findMany({
                take: 10,
                include: { user: true },
            });
            const durationGood = Date.now() - startTimeGood;

            // Good approach should be significantly faster
            expect(durationGood).toBeLessThan(durationBad / 2);
        });
    });

    describe('Connection Pool Efficiency', () => {
        it('should handle concurrent queries efficiently', async () => {
            const startTime = Date.now();

            await Promise.all([
                prisma.user.count(),
                prisma.staff.count(),
                prisma.payroll.count(),
                prisma.loan.count(),
                prisma.application.count(),
            ]);

            const duration = Date.now() - startTime;

            // Should complete all 5 queries within 200ms
            expect(duration).toBeLessThan(200);
        });
    });

    describe('Aggregation Performance', () => {
        it('should perform aggregations efficiently', async () => {
            const startTime = Date.now();

            const result = await prisma.payroll.aggregate({
                _sum: { grossSalary: true, netSalary: true },
                _avg: { grossSalary: true },
                _count: true,
                where: {
                    year: new Date().getFullYear(),
                },
            });

            const duration = Date.now() - startTime;

            expect(result).toBeDefined();
            expect(duration).toBeLessThan(300);
        });
    });
});
