import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../../staff_backend/src/app';
import TEST_CONFIG from '../../config/test.config';

const prisma = new PrismaClient({
  datasources: { db: { url: TEST_CONFIG.database.connectionString } },
});

describe('Organizations API - Real Integration Tests', () => {
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
        email: TEST_CONFIG.auth.testUsers.admin.email,
        password: TEST_CONFIG.auth.testUsers.admin.password,
      });
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should list organizations from database', async () => {
    const response = await request(app)
      .get('/api/v1/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.organizations)).toBe(true);
  });

  it('should create organization', async () => {
    const response = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        name: `Test Org ${Date.now()}`,
        code: `ORG${Date.now()}`,
        type: 'UNIVERSITY',
      })
      .expect(201);
    expect(response.body.success).toBe(true);
  });
});
