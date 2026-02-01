/**
 * SQL Injection Security Tests
 * 
 * Tests REAL SQL injection protection with:
 * - Real malicious input attempts
 * - Real database query validation
 * - Real parameterized query verification
 * - Real input sanitization
 * 
 * NO MOCKING - All tests attempt real attacks
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../../staff_backend/src/app';
import TEST_CONFIG from '../../config/test.config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: TEST_CONFIG.database.connectionString,
        },
    },
});

describe('SQL Injection Security Tests - Real Attacks', () => {
    let authToken: string;
    let csrfToken: string;

    beforeAll(async () => {
        await prisma.$connect();

        const csrfResponse = await request(app).get('/api/v1/csrf-token');
        csrfToken = csrfResponse.body.csrfToken;

        const loginResponse = await request(app)
            .post('/api/v1/auth/login')
            .set('X-CSRF-Token', csrfToken)
            .send({
                email: TEST_CONFIG.auth.testUsers.staff.email,
                password: TEST_CONFIG.auth.testUsers.staff.password,
            });

        authToken = loginResponse.body.token;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('Login Form SQL Injection', () => {
        const sqlInjectionPayloads = [
            "' OR '1'='1",
            "' OR '1'='1' --",
            "' OR '1'='1' /*",
            "admin'--",
            "' OR 1=1--",
            "' UNION SELECT NULL--",
            "1' AND '1' = '1",
            "' DROP TABLE users--",
        ];

        sqlInjectionPayloads.forEach((payload) => {
            it(`should prevent SQL injection: ${payload}`, async () => {
                const response = await request(app)
                    .post('/api/v1/auth/login')
                    .set('X-CSRF-Token', csrfToken)
                    .send({
                        email: payload,
                        password: payload,
                    });

                // Should fail authentication, not execute SQL
                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);

                // Verify database integrity
                const userCount = await prisma.user.count();
                expect(userCount).toBeGreaterThan(0); // DB still intact
            });
        });
    });

    describe('Search Field SQL Injection', () => {
        it('should prevent SQL injection in staff search', async () => {
            const maliciousSearch = "'; DROP TABLE staff; --";

            const response = await request(app)
                .get(`/api/v1/staff?search=${encodeURIComponent(maliciousSearch)}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify staff table still exists
            const staffCount = await prisma.staff.count();
            expect(staffCount).toBeGreaterThan(0);
        });

        it('should prevent SQL injection in payroll search', async () => {
            const maliciousInput = "1' OR '1'='1";

            const response = await request(app)
                .get(`/api/v1/payroll?staffId=${encodeURIComponent(maliciousInput)}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Filter Parameter SQL Injection', () => {
        it('should prevent SQL injection in department filter', async () => {
            const maliciousFilter = "IT' OR '1'='1";

            const response = await request(app)
                .get(`/api/v1/staff?department=${encodeURIComponent(maliciousFilter)}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Should return empty or only IT department, not all staff
            if (response.body.staff.length > 0) {
                response.body.staff.forEach((staff: any) => {
                    expect(staff.department).toBe('IT');
                });
            }
        });
    });

    describe('Sort Parameter SQL Injection', () => {
        it('should prevent SQL injection in sort parameter', async () => {
            const maliciousSortPayloads = [
                "firstName; DROP TABLE users;--",
                "firstName' OR '1'='1",
                "firstName UNION SELECT password FROM users--",
            ];

            for (const payload of maliciousSortPayloads) {
                const response = await request(app)
                    .get(`/api/v1/staff?sort=${encodeURIComponent(payload)}`)
                    .set('Authorization', `Bearer ${authToken}`);

                // Should either reject or ignore malicious sort
                expect([200, 400]).toContain(response.status);

                // Verify database integrity
                const userCount = await prisma.user.count();
                expect(userCount).toBeGreaterThan(0);
            }
        });
    });

    describe('ID Parameter SQL Injection', () => {
        it('should prevent SQL injection in ID lookup', async () => {
            const maliciousId = "1' OR '1'='1";

            const response = await request(app)
                .get(`/api/v1/staff/${encodeURIComponent(maliciousId)}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST Data SQL Injection', () => {
        it('should prevent SQL injection in user creation', async () => {
            const maliciousData = {
                email: "test@test.com'; DROP TABLE users; --",
                password: "password' OR '1'='1",
                firstName: "Test'; DELETE FROM users WHERE '1'='1",
                lastName: "User",
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .set('X-CSRF-Token', csrfToken)
                .send(maliciousData);

            // Should either reject or sanitize
            if (response.status === 201) {
                // If created, verify data was sanitized
                const user = response.body.user;
                expect(user.firstName).not.toContain('DELETE');
                expect(user.firstName).not.toContain('DROP');

                // Cleanup
                await prisma.user.delete({ where: { id: user.id } });
            }

            // Verify database integrity
            const userCount = await prisma.user.count();
            expect(userCount).toBeGreaterThan(0);
        });
    });

    describe('Header Injection', () => {
        it('should prevent SQL injection in custom headers', async () => {
            const response = await request(app)
                .get('/api/v1/staff')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-Custom-Header', "'; DROP TABLE users; --")
                .expect(200);

            // Verify database integrity
            const userCount = await prisma.user.count();
            expect(userCount).toBeGreaterThan(0);
        });
    });

    describe('Stored Procedure Injection', () => {
        it('should prevent injection in complex queries', async () => {
            const maliciousInput = {
                month: "1; EXEC sp_executesql N'DROP TABLE payroll'",
                year: "2026' OR '1'='1",
            };

            const response = await request(app)
                .get(`/api/v1/payroll?month=${maliciousInput.month}&year=${maliciousInput.year}`)
                .set('Authorization', `Bearer ${authToken}`);

            // Should reject invalid input
            expect([200, 400]).toContain(response.status);

            // Verify payroll table exists
            const payrollCount = await prisma.payroll.count();
            expect(payrollCount).toBeGreaterThan(0);
        });
    });

    describe('Database Integrity Verification', () => {
        it('should maintain all tables after injection attempts', async () => {
            // Verify all critical tables exist
            const [users, staff, payroll, loans, applications] = await Promise.all([
                prisma.user.count(),
                prisma.staff.count(),
                prisma.payroll.count(),
                prisma.loan.count(),
                prisma.application.count(),
            ]);

            expect(users).toBeGreaterThan(0);
            expect(staff).toBeGreaterThan(0);
            expect(payroll).toBeGreaterThan(0);
            expect(loans).toBeGreaterThan(0);
            expect(applications).toBeGreaterThan(0);
        });

        it('should verify no unauthorized data modifications', async () => {
            // Get initial admin count
            const adminsBefore = await prisma.user.count({
                where: { role: 'ADMIN' },
            });

            // Attempt privilege escalation via SQL injection
            const response = await request(app)
                .put('/api/v1/staff/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    role: "ADMIN'; UPDATE users SET role='ADMIN' WHERE '1'='1",
                });

            // Verify admin count unchanged
            const adminsAfter = await prisma.user.count({
                where: { role: 'ADMIN' },
            });

            expect(adminsAfter).toBe(adminsBefore);
        });
    });
});
