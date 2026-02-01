/**
 * Authentication API Integration Tests
 * 
 * Tests REAL authentication flows with:
 * - Real database connections
 * - Real user credentials
 * - Real JWT token generation
 * - Real password hashing
 * 
 * NO MOCKING - All tests use actual API and database
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import app from '../../../src/app';
import TEST_CONFIG from '../../config/test.config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: TEST_CONFIG.database.connectionString,
        },
    },
});

describe('Authentication API - Real Integration Tests', () => {
    let testUserId = '';
    let authToken: string;
    let refreshToken: string;
    let csrfToken: string;

    beforeAll(async () => {
        // Ensure test database is connected
        await prisma.$connect();
    });

    afterAll(async () => {
        // Cleanup: Delete test user if created
        if (testUserId) {
            await prisma.user.delete({ where: { id: testUserId } }).catch(() => { });
        }
        await prisma.$disconnect();
    });

    describe('POST /api/v1/csrf-token', () => {
        it('should generate real CSRF token', async () => {
            const response = await request(app)
                .get('/api/v1/csrf-token')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.csrfToken).toBeDefined();
            expect(typeof response.body.csrfToken).toBe('string');
            expect(response.body.csrfToken.length).toBeGreaterThan(0);

            // Store for later use
            csrfToken = response.body.csrfToken;

            // Verify token is stored in Redis (real check)
            // This would require Redis client, but we verify through usage
        });
    });

    describe('POST /api/v1/auth/register', () => {
        it('should return 403 as self-registration is disabled', async () => {
            const userData = {
                email: `test.${Date.now()}@uhi.org`,
                password: 'TestPassword123!',
                first_name: 'Test',
                last_name: 'User',
                phone: '+256700000000',
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .set('X-CSRF-Token', csrfToken)
                .send(userData)
                .expect(403);

            expect(response.body.message).toContain('disabled');
        });

        it('should reject duplicate email with real database constraint', async () => {
            const userData = {
                email: 'staff.test@uhi.org', // Existing test user
                password: 'TestPassword123!',
                first_name: 'Duplicate',
                last_name: 'User',
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .set('X-CSRF-Token', csrfToken)
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('email');
        });

        it('should validate password strength', async () => {
            const userData = {
                email: `weak.${Date.now()}@uhi.org`,
                password: '123', // Weak password
                first_name: 'Test',
                last_name: 'User',
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .set('X-CSRF-Token', csrfToken)
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('password');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login with real credentials and generate JWT', async () => {
            const credentials = {
                staffId: 'STF001',
                email: TEST_CONFIG.auth.testUsers.staff.email,
                password: TEST_CONFIG.auth.testUsers.staff.password,
            };

            const response = await request(app)
                .post('/api/v1/auth/login')
                .set('X-CSRF-Token', csrfToken)
                .send(credentials)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.email).toBe(credentials.email);

            // Store tokens for later tests
            authToken = response.body.data.accessToken;
            refreshToken = response.body.data.refreshToken;
            console.log('Login Test: Captured refreshToken:', refreshToken ? 'YES' : 'NO');

            // Verify token structure
            const parts = authToken.split('.');
            expect(parts.length).toBe(3); // JWT has 3 parts


        });

        it('should reject invalid credentials', async () => {
            const credentials = {
                email: TEST_CONFIG.auth.testUsers.staff.email,
                password: 'WrongPassword123!',
            };

            const response = await request(app)
                .post('/api/v1/auth/login')
                .set('X-CSRF-Token', csrfToken)
                .send(credentials)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Invalid');
        });

        it('should reject non-existent user', async () => {
            const credentials = {
                email: 'nonexistent@uhi.org',
                password: 'Password123!',
            };

            const response = await request(app)
                .post('/api/v1/auth/login')
                .set('X-CSRF-Token', csrfToken)
                .send(credentials)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should reject inactive user', async () => {
            // Create inactive user in real database
            const inactiveUser = await prisma.user.create({
                data: {
                    staff_id: 'INACTIVE_' + Date.now(),
                    email: `inactive.${Date.now()}@uhi.org`,
                    password_hash: await bcrypt.hash('Password123!', 10),
                    first_name: 'Inactive',
                    last_name: 'User',
                    status: 'inactive',
                },
            });

            const credentials = {
                email: inactiveUser.email,
                password: 'Password123!',
            };

            const response = await request(app)
                .post('/api/v1/auth/login')
                .set('X-CSRF-Token', csrfToken)
                .send(credentials)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('inactive');

            // Cleanup
            await prisma.user.delete({ where: { id: inactiveUser.id } });
        });
    });

    describe('POST /api/v1/auth/refresh', () => {
        it('should refresh token with real refresh token', async () => {
            console.log('Refresh Test: Using refreshToken:', refreshToken);
            const oldRefreshToken = refreshToken;

            // Wait a bit to ensure new token is different
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Refresh token
            const response = await request(app)
                .post('/api/v1/auth/refresh')
                .set('X-CSRF-Token', csrfToken)
                .send({ refreshToken: oldRefreshToken })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
            expect(response.body.data.accessToken).not.toBe(loginResponse.body.token);
        });

        it('should reject invalid refresh token', async () => {
            const response = await request(app)
                .post('/api/v1/auth/refresh')
                .set('X-CSRF-Token', csrfToken)
                .send({ refreshToken: 'invalid.token.here' })
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/logout', () => {
        it('should logout and invalidate tokens in real Redis', async () => {
            // Login first
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .set('X-CSRF-Token', csrfToken)
                .send({
                    email: TEST_CONFIG.auth.testUsers.staff.email,
                    password: TEST_CONFIG.auth.testUsers.staff.password,
                });

            const token = loginResponse.body.token;

            // Logout
            const response = await request(app)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${token}`)
                .set('X-CSRF-Token', csrfToken)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify token is invalidated by trying to use it
            const protectedResponse = await request(app)
                .get('/api/v1/staff/profile')
                .set('Authorization', `Bearer ${token}`)
                .expect(401);

            expect(protectedResponse.body.success).toBe(false);
        });
    });



});
