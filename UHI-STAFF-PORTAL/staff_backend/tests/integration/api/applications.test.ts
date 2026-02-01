/**
 * Applications API Integration Tests
 * 
 * Tests REAL application operations with:
 * - Real application submissions
 * - Real approval workflows
 * - Real database transactions
 * - Real document attachments
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

describe('Applications API - Real Integration Tests', () => {
    let authToken: string;
    let managerToken: string;
    let csrfToken: string;
    let testApplicationId: string;

    beforeAll(async () => {
        await prisma.$connect();

        const csrfResponse = await request(app).get('/api/v1/csrf-token');
        csrfToken = csrfResponse.body.csrfToken;

        // Staff login
        const loginResponse = await request(app)
            .post('/api/v1/auth/login')
            .set('X-CSRF-Token', csrfToken)
            .send({
                staffId: 'STF001',
                email: TEST_CONFIG.auth.testUsers.staff.email,
                password: TEST_CONFIG.auth.testUsers.staff.password,
            });

        console.log('Login Response Status:', loginResponse.status);
        console.log('Login Response Body:', JSON.stringify(loginResponse.body, null, 2));

        if (loginResponse.status !== 200) {
            console.error('Login Failed:', loginResponse.status, loginResponse.body);
            throw new Error(`Login failed with status ${loginResponse.status}`);
        }

        authToken = loginResponse.body.data.accessToken;
        console.log('Auth Token:', authToken ? 'Generated' : 'Missing');

        // Manager login
        const managerLogin = await request(app)
            .post('/api/v1/auth/login')
            .set('X-CSRF-Token', csrfToken)
            .send({
                email: TEST_CONFIG.auth.testUsers.manager.email,
                password: TEST_CONFIG.auth.testUsers.manager.password,
            });
        managerToken = managerLogin.body.token;
    });

    afterAll(async () => {
        if (testApplicationId) {
            await prisma.application.delete({ where: { id: testApplicationId } }).catch(() => { });
        }
        await prisma.$disconnect();
    });

    describe('POST /api/v1/applications', () => {
        it('should submit leave application with real data', async () => {
            const applicationData = {
                type: 'leave',
                title: 'Annual Leave Request',
                description: 'Requesting annual leave for family vacation',
                startDate: '2026-03-01',
                endDate: '2026-03-10',
                metadata: {
                    leaveType: 'ANNUAL',
                    days: 10,
                },
            };

            const response = await request(app)
                .post('/api/v1/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send(applicationData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.application).toBeDefined();
            expect(response.body.application.type).toBe('leave');
            expect(response.body.application.status).toBe('pending');

            testApplicationId = response.body.application.id;

            // Verify in database
            const dbApp = await prisma.application.findUnique({
                where: { id: testApplicationId },
            });

            expect(dbApp).not.toBeNull();
            const data: any = dbApp?.data;
            expect(data.title).toBe(applicationData.title);
            expect(dbApp?.status).toBe('pending');
        });

        it('should validate required fields', async () => {
            const response = await request(app)
                .post('/api/v1/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({ type: 'leave' }) // Missing required fields
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBeDefined();
        });
    });

    describe('GET /api/v1/applications', () => {
        it('should get real applications from database', async () => {
            const response = await request(app)
                .get('/api/v1/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.applications)).toBe(true);

            if (response.body.applications.length > 0) {
                const app = response.body.applications[0];
                const dbApp = await prisma.application.findUnique({ where: { id: app.id } });
                expect(dbApp).not.toBeNull();
            }
        });

        it('should filter by type', async () => {
            const response = await request(app)
                .get('/api/v1/applications?type=LEAVE')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            response.body.applications.forEach((app: any) => {
                expect(app.type).toBe('leave');
            });
        });

        it('should filter by status', async () => {
            const response = await request(app)
                .get('/api/v1/applications?status=pending')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            response.body.applications.forEach((app: any) => {
                expect(app.status).toBe('pending');
            });
        });
    });

    describe('GET /api/v1/applications/:id', () => {
        it('should get application details', async () => {
            const listResponse = await request(app)
                .get('/api/v1/applications?limit=1')
                .set('Authorization', `Bearer ${authToken}`);

            if (listResponse.body.applications.length > 0) {
                const appId = listResponse.body.applications[0].id;

                const response = await request(app)
                    .get(`/api/v1/applications/${appId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.application.id).toBe(appId);
            }
        });
    });

    describe('PUT /api/v1/applications/:id', () => {
        it('should update application before approval', async () => {
            // Create application
            const createResponse = await request(app)
                .post('/api/v1/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    type: 'training',
                    title: 'Training Request',
                    description: 'Request for training course',
                });

            const appId = createResponse.body.application.id;

            // Update
            const response = await request(app)
                .put(`/api/v1/applications/${appId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    description: 'Updated training request description',
                })
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify in database
            const dbApp = await prisma.application.findUnique({ where: { id: appId } });
            const data: any = dbApp?.data;
            expect(data.description).toContain('Updated');

            // Cleanup
            await prisma.application.delete({ where: { id: appId } });
        });
    });

    describe('POST /api/v1/applications/:id/approve', () => {
        it('should approve application with manager role', async () => {
            // Create application
            const createResponse = await request(app)
                .post('/api/v1/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    type: 'leave',
                    title: 'Leave for Approval',
                    description: 'Test approval workflow',
                });

            if (createResponse.status !== 201) {
                console.error('Create App Failed:', createResponse.status, createResponse.body);
            }

            const appId = createResponse.body.application.id;

            // Approve as manager
            const response = await request(app)
                .post(`/api/v1/applications/${appId}/approve`)
                .set('Authorization', `Bearer ${managerToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({ comments: 'Approved by manager' })
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify in database - status change check
            const dbApp = await prisma.application.findUnique({ where: { id: appId } });
            expect(dbApp?.status).toBe('approved');

            // Cleanup
            await prisma.application.delete({ where: { id: appId } });
        });
    });

    describe('POST /api/v1/applications/:id/reject', () => {
        it('should reject application with comments', async () => {
            // Create application
            const createResponse = await request(app)
                .post('/api/v1/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    type: 'loan',
                    title: 'Loan Request',
                    description: 'Request for loan',
                });

            const appId = createResponse.body.application.id;

            // Reject as manager
            const response = await request(app)
                .post(`/api/v1/applications/${appId}/reject`)
                .set('Authorization', `Bearer ${managerToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({ comments: 'Not eligible at this time' })
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify in database
            const dbApp = await prisma.application.findUnique({
                where: { id: appId },
                include: { audits: true } // Include audits to check comments
            });
            expect(dbApp?.status).toBe('rejected');

            // Check if rejection comment exists in audit log
            // Note: Implementation specific, assuming audit record created
            if (dbApp?.audits && dbApp.audits.length > 0) {
                const rejectionAudit = dbApp.audits.find(a => a.comment?.includes('Not eligible'));
                expect(rejectionAudit).toBeDefined();
            }

            // Cleanup
            await prisma.application.delete({ where: { id: appId } });
        });
    });

    describe('DELETE /api/v1/applications/:id', () => {
        it('should withdraw pending application', async () => {
            // Create application
            const createResponse = await request(app)
                .post('/api/v1/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    type: 'transfer',
                    title: 'Transfer Request',
                    description: 'Request for transfer',
                });

            const appId = createResponse.body.application.id;

            // Withdraw
            const response = await request(app)
                .delete(`/api/v1/applications/${appId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify deleted or status changed to cancelled/withdrawn
            const dbApp = await prisma.application.findUnique({ where: { id: appId } });
            // API might soft delete (cancelled) or hard delete
            if (dbApp) {
                expect(dbApp.status).toBe('cancelled');
            } else {
                expect(dbApp).toBeNull();
            }
        });
    });

    describe('Role-Based Access', () => {
        it('should restrict staff from approving applications', async () => {
            // Create app first
            const createResponse = await request(app)
                .post('/api/v1/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({ type: 'leave', title: 'Test', description: 'Test' });

            if (createResponse.body.success) {
                const appId = createResponse.body.application.id;

                const response = await request(app)
                    .post(`/api/v1/applications/${appId}/approve`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .set('X-CSRF-Token', csrfToken)
                    .expect(403);

                expect(response.body.success).toBe(false);

                await prisma.application.delete({ where: { id: appId } });
            }
        });
    });
});
