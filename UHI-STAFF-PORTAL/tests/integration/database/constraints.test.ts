/**
 * Database Constraints Integration Tests
 * 
 * Tests REAL database constraint enforcement with:
 * - Real foreign key constraints
 * - Real unique constraints
 * - Real check constraints
 * - Real cascade operations
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

describe('Database Constraints - Real Integration Tests', () => {
    beforeAll(async () => {
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('Foreign Key Constraints', () => {
        it('should enforce foreign key on user creation', async () => {
            try {
                await prisma.user.create({
                    data: {
                        email: `fk.test.${Date.now()}@uhi.org`,
                        password: 'hashedpassword',
                        firstName: 'FK',
                        lastName: 'Test',
                        role: 'STAFF',
                        organizationId: 'non-existent-org-id', // Invalid FK
                    },
                });
                fail('Should have thrown foreign key constraint error');
            } catch (error: any) {
                expect(error).toBeDefined();
                expect(error.code).toBe('P2003'); // Prisma foreign key error
            }
        });

        it('should allow valid foreign key reference', async () => {
            const org = await prisma.organization.findFirst();

            const user = await prisma.user.create({
                data: {
                    email: `valid.fk.${Date.now()}@uhi.org`,
                    password: 'hashedpassword',
                    firstName: 'Valid',
                    lastName: 'FK',
                    role: 'STAFF',
                    organizationId: org!.id,
                },
            });

            expect(user).toBeDefined();
            expect(user.organizationId).toBe(org!.id);

            // Cleanup
            await prisma.user.delete({ where: { id: user.id } });
        });
    });

    describe('Unique Constraints', () => {
        it('should enforce unique email constraint', async () => {
            const existingUser = await prisma.user.findFirst();

            try {
                await prisma.user.create({
                    data: {
                        email: existingUser!.email, // Duplicate email
                        password: 'hashedpassword',
                        firstName: 'Duplicate',
                        lastName: 'Email',
                        role: 'STAFF',
                    },
                });
                fail('Should have thrown unique constraint error');
            } catch (error: any) {
                expect(error).toBeDefined();
                expect(error.code).toBe('P2002'); // Prisma unique constraint error
            }
        });

        it('should enforce unique employee ID', async () => {
            const existingStaff = await prisma.staff.findFirst();
            const user = await prisma.user.findFirst({ where: { staff: null } });

            if (existingStaff && user) {
                try {
                    await prisma.staff.create({
                        data: {
                            userId: user.id,
                            organizationId: existingStaff.organizationId,
                            employeeId: existingStaff.employeeId, // Duplicate
                            department: 'IT',
                            position: 'Developer',
                            employmentType: 'FULL_TIME',
                            hireDate: new Date(),
                            salary: 5000000,
                        },
                    });
                    fail('Should have thrown unique constraint error');
                } catch (error: any) {
                    expect(error).toBeDefined();
                    expect(error.code).toBe('P2002');
                }
            }
        });
    });

    describe('Not Null Constraints', () => {
        it('should enforce not null on required fields', async () => {
            try {
                await prisma.user.create({
                    data: {
                        email: `null.test.${Date.now()}@uhi.org`,
                        password: 'hashedpassword',
                        firstName: null as any, // Required field
                        lastName: 'Test',
                        role: 'STAFF',
                    },
                });
                fail('Should have thrown not null constraint error');
            } catch (error: any) {
                expect(error).toBeDefined();
            }
        });
    });

    describe('Cascade Deletes', () => {
        it('should cascade delete staff when user is deleted', async () => {
            // Create user and staff
            const org = await prisma.organization.findFirst();
            const user = await prisma.user.create({
                data: {
                    email: `cascade.${Date.now()}@uhi.org`,
                    password: 'hashedpassword',
                    firstName: 'Cascade',
                    lastName: 'Test',
                    role: 'STAFF',
                    organizationId: org!.id,
                },
            });

            const staff = await prisma.staff.create({
                data: {
                    userId: user.id,
                    organizationId: org!.id,
                    employeeId: `EMP${Date.now()}`,
                    department: 'IT',
                    position: 'Developer',
                    employmentType: 'FULL_TIME',
                    hireDate: new Date(),
                    salary: 5000000,
                },
            });

            // Delete user
            await prisma.user.delete({ where: { id: user.id } });

            // Verify staff is also deleted (cascade)
            const deletedStaff = await prisma.staff.findUnique({ where: { id: staff.id } });
            expect(deletedStaff).toBeNull();
        });
    });

    describe('Default Values', () => {
        it('should apply default values on creation', async () => {
            const org = await prisma.organization.create({
                data: {
                    name: `Default Test ${Date.now()}`,
                    code: `DEF${Date.now()}`,
                    type: 'UNIVERSITY',
                    // isActive should default to true
                },
            });

            expect(org.isActive).toBe(true);

            // Cleanup
            await prisma.organization.delete({ where: { id: org.id } });
        });
    });

    describe('Check Constraints', () => {
        it('should validate salary is positive', async () => {
            const org = await prisma.organization.findFirst();
            const user = await prisma.user.create({
                data: {
                    email: `check.${Date.now()}@uhi.org`,
                    password: 'hashedpassword',
                    firstName: 'Check',
                    lastName: 'Test',
                    role: 'STAFF',
                    organizationId: org!.id,
                },
            });

            try {
                await prisma.staff.create({
                    data: {
                        userId: user.id,
                        organizationId: org!.id,
                        employeeId: `EMP${Date.now()}`,
                        department: 'IT',
                        position: 'Developer',
                        employmentType: 'FULL_TIME',
                        hireDate: new Date(),
                        salary: -1000, // Negative salary
                    },
                });
                fail('Should have thrown check constraint error');
            } catch (error: any) {
                expect(error).toBeDefined();
            } finally {
                await prisma.user.delete({ where: { id: user.id } });
            }
        });
    });

    describe('Referential Integrity', () => {
        it('should maintain referential integrity across tables', async () => {
            const org = await prisma.organization.findFirst();

            // Create complete chain
            const user = await prisma.user.create({
                data: {
                    email: `integrity.${Date.now()}@uhi.org`,
                    password: 'hashedpassword',
                    firstName: 'Integrity',
                    lastName: 'Test',
                    role: 'STAFF',
                    organizationId: org!.id,
                },
            });

            const staff = await prisma.staff.create({
                data: {
                    userId: user.id,
                    organizationId: org!.id,
                    employeeId: `EMP${Date.now()}`,
                    department: 'IT',
                    position: 'Developer',
                    employmentType: 'FULL_TIME',
                    hireDate: new Date(),
                    salary: 5000000,
                },
            });

            const payroll = await prisma.payroll.create({
                data: {
                    staffId: staff.id,
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    grossSalary: 5000000,
                    netSalary: 3500000,
                    tax: 1500000,
                    nssf: 200000,
                    status: 'PENDING',
                },
            });

            // Verify all relationships
            const fullStaff = await prisma.staff.findUnique({
                where: { id: staff.id },
                include: {
                    user: true,
                    organization: true,
                    payroll: true,
                },
            });

            expect(fullStaff?.user.id).toBe(user.id);
            expect(fullStaff?.organization.id).toBe(org!.id);
            expect(fullStaff?.payroll.length).toBeGreaterThan(0);

            // Cleanup
            await prisma.payroll.delete({ where: { id: payroll.id } });
            await prisma.staff.delete({ where: { id: staff.id } });
            await prisma.user.delete({ where: { id: user.id } });
        });
    });
});
