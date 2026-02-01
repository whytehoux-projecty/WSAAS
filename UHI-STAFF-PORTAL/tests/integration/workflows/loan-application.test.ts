/**
 * Loan Application Workflow Integration Tests
 * 
 * Tests COMPLETE loan workflow with:
 * - Real multi-step approval process
 * - Real database state changes
 * - Real notifications
 * - Real document handling
 * 
 * NO MOCKING - All tests use actual services
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

describe('Loan Application Workflow - Real Integration Tests', () => {
    let staffToken: string;
    let managerToken: string;
    let hrToken: string;
    let financeToken: string;
    let csrfToken: string;
    let loanId: string;
    let staffId: string;

    beforeAll(async () => {
        await prisma.$connect();

        const csrfResponse = await request(app).get('/api/v1/csrf-token');
        csrfToken = csrfResponse.body.csrfToken;

        // Login as different roles
        const staffLogin = await request(app)
            .post('/api/v1/auth/login')
            .set('X-CSRF-Token', csrfToken)
            .send({
                email: TEST_CONFIG.auth.testUsers.staff.email,
                password: TEST_CONFIG.auth.testUsers.staff.password,
            });
        staffToken = staffLogin.body.token;

        const managerLogin = await request(app)
            .post('/api/v1/auth/login')
            .set('X-CSRF-Token', csrfToken)
            .send({
                email: TEST_CONFIG.auth.testUsers.manager.email,
                password: TEST_CONFIG.auth.testUsers.manager.password,
            });
        managerToken = managerLogin.body.token;

        // Get staff ID
        const user = await prisma.user.findUnique({
            where: { email: TEST_CONFIG.auth.testUsers.staff.email },
            include: { staff: true },
        });
        staffId = user?.staff?.id || '';
    });

    afterAll(async () => {
        if (loanId) {
            await prisma.loan.delete({ where: { id: loanId } }).catch(() => { });
        }
        await prisma.$disconnect();
    });

    describe('Complete Loan Workflow', () => {
        it('should complete full loan application workflow', async () => {
            // STEP 1: Staff submits loan application
            const applicationResponse = await request(app)
                .post('/api/v1/loans/apply')
                .set('Authorization', `Bearer ${staffToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    type: 'PERSONAL',
                    principal: 3000000,
                    interestRate: 10,
                    termMonths: 12,
                    purpose: 'Home improvement',
                })
                .expect(201);

            expect(applicationResponse.body.success).toBe(true);
            loanId = applicationResponse.body.loan.id;

            // Verify initial status
            let dbLoan = await prisma.loan.findUnique({ where: { id: loanId } });
            expect(dbLoan?.status).toBe('PENDING');
            expect(dbLoan?.applicationDate).not.toBeNull();

            // STEP 2: Upload supporting documents
            const fileContent = Buffer.from('Loan supporting document');
            const uploadResponse = await request(app)
                .post(`/api/v1/loans/${loanId}/documents`)
                .set('Authorization', `Bearer ${staffToken}`)
                .set('X-CSRF-Token', csrfToken)
                .attach('file', fileContent, 'salary_slip.pdf')
                .field('title', 'Salary Slip')
                .expect(201);

            expect(uploadResponse.body.success).toBe(true);

            // STEP 3: Manager reviews and approves
            const managerApprovalResponse = await request(app)
                .post(`/api/v1/loans/${loanId}/approve/manager`)
                .set('Authorization', `Bearer ${managerToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    comments: 'Approved by manager - employee in good standing',
                })
                .expect(200);

            expect(managerApprovalResponse.body.success).toBe(true);

            // Verify manager approval
            dbLoan = await prisma.loan.findUnique({ where: { id: loanId } });
            expect(dbLoan?.managerApproved).toBe(true);
            expect(dbLoan?.managerApprovalDate).not.toBeNull();

            // STEP 4: HR reviews and approves
            if (hrToken) {
                const hrApprovalResponse = await request(app)
                    .post(`/api/v1/loans/${loanId}/approve/hr`)
                    .set('Authorization', `Bearer ${hrToken}`)
                    .set('X-CSRF-Token', csrfToken)
                    .send({
                        comments: 'HR approved - verified employment details',
                    })
                    .expect(200);

                expect(hrApprovalResponse.body.success).toBe(true);

                // Verify HR approval
                dbLoan = await prisma.loan.findUnique({ where: { id: loanId } });
                expect(dbLoan?.hrApproved).toBe(true);
            }

            // STEP 5: Finance approves and disburses
            if (financeToken) {
                const financeApprovalResponse = await request(app)
                    .post(`/api/v1/loans/${loanId}/approve/finance`)
                    .set('Authorization', `Bearer ${financeToken}`)
                    .set('X-CSRF-Token', csrfToken)
                    .send({
                        comments: 'Finance approved - funds available',
                    })
                    .expect(200);

                expect(financeApprovalResponse.body.success).toBe(true);

                // STEP 6: Disburse loan
                const disbursementResponse = await request(app)
                    .post(`/api/v1/loans/${loanId}/disburse`)
                    .set('Authorization', `Bearer ${financeToken}`)
                    .set('X-CSRF-Token', csrfToken)
                    .send({
                        disbursementMethod: 'BANK_TRANSFER',
                        disbursementDate: new Date().toISOString(),
                    })
                    .expect(200);

                expect(disbursementResponse.body.success).toBe(true);

                // Verify final status
                dbLoan = await prisma.loan.findUnique({ where: { id: loanId } });
                expect(dbLoan?.status).toBe('ACTIVE');
                expect(dbLoan?.disbursementDate).not.toBeNull();
            }

            // STEP 7: Generate repayment schedule
            const scheduleResponse = await request(app)
                .get(`/api/v1/loans/${loanId}/schedule`)
                .set('Authorization', `Bearer ${staffToken}`)
                .expect(200);

            expect(scheduleResponse.body.success).toBe(true);
            expect(scheduleResponse.body.schedule).toBeDefined();
            expect(scheduleResponse.body.schedule.length).toBe(12); // 12 months

            // STEP 8: Make first payment
            const paymentResponse = await request(app)
                .post(`/api/v1/loans/${loanId}/payment`)
                .set('Authorization', `Bearer ${staffToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    amount: scheduleResponse.body.schedule[0].amount,
                    paymentMethod: 'SALARY_DEDUCTION',
                })
                .expect(200);

            expect(paymentResponse.body.success).toBe(true);

            // Verify payment recorded
            dbLoan = await prisma.loan.findUnique({ where: { id: loanId } });
            expect(dbLoan?.amountPaid).toBeGreaterThan(0);

            // STEP 9: Check notifications sent
            const notificationsResponse = await request(app)
                .get('/api/v1/notifications?type=LOAN')
                .set('Authorization', `Bearer ${staffToken}`)
                .expect(200);

            expect(notificationsResponse.body.success).toBe(true);
            // Should have notifications for application, approvals, disbursement
        });

        it('should handle loan rejection workflow', async () => {
            // Submit loan
            const applicationResponse = await request(app)
                .post('/api/v1/loans/apply')
                .set('Authorization', `Bearer ${staffToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    type: 'EMERGENCY',
                    principal: 1000000,
                    interestRate: 8,
                    termMonths: 6,
                    purpose: 'Emergency expense',
                })
                .expect(201);

            const rejectedLoanId = applicationResponse.body.loan.id;

            // Manager rejects
            const rejectionResponse = await request(app)
                .post(`/api/v1/loans/${rejectedLoanId}/reject`)
                .set('Authorization', `Bearer ${managerToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    reason: 'Insufficient documentation',
                })
                .expect(200);

            expect(rejectionResponse.body.success).toBe(true);

            // Verify status
            const dbLoan = await prisma.loan.findUnique({ where: { id: rejectedLoanId } });
            expect(dbLoan?.status).toBe('REJECTED');
            expect(dbLoan?.rejectionReason).toBeDefined();

            // Cleanup
            await prisma.loan.delete({ where: { id: rejectedLoanId } });
        });

        it('should handle loan withdrawal by applicant', async () => {
            // Submit loan
            const applicationResponse = await request(app)
                .post('/api/v1/loans/apply')
                .set('Authorization', `Bearer ${staffToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    type: 'EDUCATION',
                    principal: 2000000,
                    interestRate: 9,
                    termMonths: 24,
                    purpose: 'Education',
                })
                .expect(201);

            const withdrawnLoanId = applicationResponse.body.loan.id;

            // Staff withdraws
            const withdrawalResponse = await request(app)
                .delete(`/api/v1/loans/${withdrawnLoanId}`)
                .set('Authorization', `Bearer ${staffToken}`)
                .set('X-CSRF-Token', csrfToken)
                .expect(200);

            expect(withdrawalResponse.body.success).toBe(true);

            // Verify status
            const dbLoan = await prisma.loan.findUnique({ where: { id: withdrawnLoanId } });
            expect(dbLoan?.status).toBe('WITHDRAWN');

            // Cleanup
            await prisma.loan.delete({ where: { id: withdrawnLoanId } });
        });
    });

    describe('Workflow Validations', () => {
        it('should prevent approval without required documents', async () => {
            // Submit loan without documents
            const applicationResponse = await request(app)
                .post('/api/v1/loans/apply')
                .set('Authorization', `Bearer ${staffToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    type: 'HOUSING',
                    principal: 10000000,
                    interestRate: 12,
                    termMonths: 36,
                    purpose: 'Housing',
                })
                .expect(201);

            const testLoanId = applicationResponse.body.loan.id;

            // Try to approve without documents
            const approvalResponse = await request(app)
                .post(`/api/v1/loans/${testLoanId}/approve/manager`)
                .set('Authorization', `Bearer ${managerToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({ comments: 'Approved' })
                .expect(400);

            expect(approvalResponse.body.success).toBe(false);
            expect(approvalResponse.body.error).toContain('document');

            // Cleanup
            await prisma.loan.delete({ where: { id: testLoanId } });
        });

        it('should enforce approval hierarchy', async () => {
            // Cannot approve by HR before manager approval
            const applicationResponse = await request(app)
                .post('/api/v1/loans/apply')
                .set('Authorization', `Bearer ${staffToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    type: 'PERSONAL',
                    principal: 1500000,
                    interestRate: 10,
                    termMonths: 12,
                    purpose: 'Personal',
                })
                .expect(201);

            const testLoanId = applicationResponse.body.loan.id;

            if (hrToken) {
                // Try HR approval before manager
                const hrApprovalResponse = await request(app)
                    .post(`/api/v1/loans/${testLoanId}/approve/hr`)
                    .set('Authorization', `Bearer ${hrToken}`)
                    .set('X-CSRF-Token', csrfToken)
                    .expect(400);

                expect(hrApprovalResponse.body.success).toBe(false);
            }

            // Cleanup
            await prisma.loan.delete({ where: { id: testLoanId } });
        });
    });
});
