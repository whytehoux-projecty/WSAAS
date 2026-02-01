/**
 * Payroll API Integration Tests
 * 
 * Tests REAL payroll operations with:
 * - Real salary calculations
 * - Real tax and NSSF deductions
 * - Real database transactions
 * - Real payment processing
 * 
 * NO MOCKING - All tests use actual API and database
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../../src/app';
import TEST_CONFIG from '../../config/test.config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: TEST_CONFIG.database.connectionString,
        },
    },
});

describe('Payroll API - Real Integration Tests', () => {
    let authToken: string;
    let csrfToken: string;
    let staffId: string;

    beforeAll(async () => {
        await prisma.$connect();

        // Get CSRF token
        const csrfResponse = await request(app).get('/api/v1/csrf-token');
        csrfToken = csrfResponse.body.csrfToken;

        // Login
        const loginResponse = await request(app)
            .post('/api/v1/auth/login')
            .set('X-CSRF-Token', csrfToken)
            .send({
                email: TEST_CONFIG.auth.testUsers.staff.email,
                password: TEST_CONFIG.auth.testUsers.staff.password,
            });

        authToken = loginResponse.body.token;

        // Get staff ID
        const user = await prisma.user.findUnique({
            where: { email: TEST_CONFIG.auth.testUsers.staff.email },
            include: { staff: true },
        });
        staffId = user?.staff?.id || '';
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('GET /api/v1/payroll', () => {
        it('should get real payroll records from database', async () => {
            const response = await request(app)
                .get('/api/v1/payroll')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.payroll).toBeDefined();
            expect(Array.isArray(response.body.payroll)).toBe(true);

            // Verify data is from real database
            if (response.body.payroll.length > 0) {
                const firstPayroll = response.body.payroll[0];
                const dbPayroll = await prisma.payroll.findUnique({
                    where: { id: firstPayroll.id },
                });

                expect(dbPayroll).not.toBeNull();
                expect(dbPayroll?.grossSalary).toBe(firstPayroll.grossSalary);
                expect(dbPayroll?.netSalary).toBe(firstPayroll.netSalary);
            }
        });

        it('should filter payroll by month and year', async () => {
            const currentDate = new Date();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();

            const response = await request(app)
                .get(`/api/v1/payroll?month=${month}&year=${year}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify all records match the filter
            response.body.payroll.forEach((record: any) => {
                expect(record.month).toBe(month);
                expect(record.year).toBe(year);
            });
        });

        it('should paginate payroll records', async () => {
            const response = await request(app)
                .get('/api/v1/payroll?page=1&limit=5')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.payroll.length).toBeLessThanOrEqual(5);
            expect(response.body.pagination).toBeDefined();
            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(5);
        });
    });

    describe('GET /api/v1/payroll/:id', () => {
        it('should get real payroll details with calculations', async () => {
            // Get a payroll ID
            const listResponse = await request(app)
                .get('/api/v1/payroll?limit=1')
                .set('Authorization', `Bearer ${authToken}`);

            const payrollId = listResponse.body.payroll[0].id;

            const response = await request(app)
                .get(`/api/v1/payroll/${payrollId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.payroll).toBeDefined();
            expect(response.body.payroll.id).toBe(payrollId);

            // Verify calculations
            const payroll = response.body.payroll;
            expect(payroll.grossSalary).toBeGreaterThan(0);
            expect(payroll.tax).toBeGreaterThanOrEqual(0);
            expect(payroll.nssf).toBeGreaterThanOrEqual(0);

            // Verify net salary calculation
            const expectedNet = payroll.grossSalary + payroll.allowances -
                payroll.tax - payroll.nssf - payroll.deductions;
            expect(Math.abs(payroll.netSalary - expectedNet)).toBeLessThan(1); // Allow for rounding
        });
    });

    describe('POST /api/v1/payroll/calculate', () => {
        it('should calculate payroll with real tax and NSSF', async () => {
            const response = await request(app)
                .post('/api/v1/payroll/calculate')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    staffId,
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    allowances: 200000,
                    deductions: 50000,
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.calculation).toBeDefined();

            const calc = response.body.calculation;

            // Verify tax calculation (30% in Uganda)
            const expectedTax = calc.grossSalary * 0.3;
            expect(Math.abs(calc.tax - expectedTax)).toBeLessThan(calc.grossSalary * 0.01); // Within 1%

            // Verify NSSF calculation (5%, max 200k)
            const expectedNSSF = Math.min(calc.grossSalary * 0.05, 200000);
            expect(Math.abs(calc.nssf - expectedNSSF)).toBeLessThan(1000); // Within 1k

            // Verify net salary
            const expectedNet = calc.grossSalary + calc.allowances -
                calc.tax - calc.nssf - calc.deductions;
            expect(Math.abs(calc.netSalary - expectedNet)).toBeLessThan(1);
        });
    });

    describe('POST /api/v1/payroll/process', () => {
        it('should process payroll and create real database records', async () => {
            const month = new Date().getMonth() + 1;
            const year = new Date().getFullYear();

            const response = await request(app)
                .post('/api/v1/payroll/process')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    month,
                    year,
                    staffIds: [staffId],
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.processed).toBeGreaterThan(0);

            // Verify payroll records created in database
            const dbPayroll = await prisma.payroll.findMany({
                where: {
                    staffId,
                    month,
                    year,
                },
            });

            expect(dbPayroll.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/v1/payroll/payslip/:id', () => {
        it('should generate real payslip PDF', async () => {
            // Get a payroll ID
            const listResponse = await request(app)
                .get('/api/v1/payroll?limit=1')
                .set('Authorization', `Bearer ${authToken}`);

            const payrollId = listResponse.body.payroll[0].id;

            const response = await request(app)
                .get(`/api/v1/payroll/payslip/${payrollId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Verify PDF response
            expect(response.headers['content-type']).toContain('application/pdf');
            expect(response.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/v1/payroll/export', () => {
        it('should export real payroll data to Excel', async () => {
            const response = await request(app)
                .get('/api/v1/payroll/export?format=excel')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Verify Excel response
            expect(response.headers['content-type']).toContain('spreadsheet');
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should export payroll data to CSV', async () => {
            const response = await request(app)
                .get('/api/v1/payroll/export?format=csv')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Verify CSV response
            expect(response.headers['content-type']).toContain('text/csv');
            expect(response.text.length).toBeGreaterThan(0);
            expect(response.text).toContain('Gross Salary');
        });
    });

    describe('PUT /api/v1/payroll/:id/status', () => {
        it('should update payroll status in real database', async () => {
            // Get a pending payroll
            const listResponse = await request(app)
                .get('/api/v1/payroll?status=PENDING&limit=1')
                .set('Authorization', `Bearer ${authToken}`);

            if (listResponse.body.payroll.length > 0) {
                const payrollId = listResponse.body.payroll[0].id;

                const response = await request(app)
                    .put(`/api/v1/payroll/${payrollId}/status`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .set('X-CSRF-Token', csrfToken)
                    .send({ status: 'PROCESSED' })
                    .expect(200);

                expect(response.body.success).toBe(true);

                // Verify status updated in database
                const dbPayroll = await prisma.payroll.findUnique({
                    where: { id: payrollId },
                });

                expect(dbPayroll?.status).toBe('PROCESSED');
            }
        });
    });

    describe('GET /api/v1/payroll/history', () => {
        it('should get real payroll history with trends', async () => {
            const response = await request(app)
                .get('/api/v1/payroll/history?months=12')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.history).toBeDefined();
            expect(Array.isArray(response.body.history)).toBe(true);
            expect(response.body.history.length).toBeLessThanOrEqual(12);

            // Verify trend calculations
            if (response.body.history.length > 1) {
                expect(response.body.trends).toBeDefined();
                expect(response.body.trends.averageGrossSalary).toBeGreaterThan(0);
                expect(response.body.trends.averageNetSalary).toBeGreaterThan(0);
            }
        });
    });

    describe('Data Integrity', () => {
        it('should maintain referential integrity on payroll updates', async () => {
            // Get a payroll record
            const listResponse = await request(app)
                .get('/api/v1/payroll?limit=1')
                .set('Authorization', `Bearer ${authToken}`);

            const payrollId = listResponse.body.payroll[0].id;

            // Update payroll
            const response = await request(app)
                .put(`/api/v1/payroll/${payrollId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({ allowances: 250000 })
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify staff relationship intact
            const dbPayroll = await prisma.payroll.findUnique({
                where: { id: payrollId },
                include: { staff: true },
            });

            expect(dbPayroll?.staff).not.toBeNull();
        });

        it('should prevent duplicate payroll for same month', async () => {
            const month = new Date().getMonth() + 1;
            const year = new Date().getFullYear();

            // Try to create duplicate payroll
            const response = await request(app)
                .post('/api/v1/payroll')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    staffId,
                    month,
                    year,
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('already exists');
        });
    });

    describe('Role-Based Access', () => {
        it('should allow HR to process payroll', async () => {
            // Login as HR
            const hrLogin = await request(app)
                .post('/api/v1/auth/login')
                .set('X-CSRF-Token', csrfToken)
                .send({
                    email: 'hr.test@uhi.org',
                    password: 'TestHR123!',
                });

            if (hrLogin.status === 200) {
                const hrToken = hrLogin.body.token;

                const response = await request(app)
                    .post('/api/v1/payroll/process')
                    .set('Authorization', `Bearer ${hrToken}`)
                    .set('X-CSRF-Token', csrfToken)
                    .send({
                        month: new Date().getMonth() + 1,
                        year: new Date().getFullYear(),
                        staffIds: [staffId],
                    })
                    .expect(200);

                expect(response.body.success).toBe(true);
            }
        });

        it('should restrict staff from processing payroll', async () => {
            const response = await request(app)
                .post('/api/v1/payroll/process')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    staffIds: [staffId],
                })
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('permission');
        });
    });
});
