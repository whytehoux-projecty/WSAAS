import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../../staff_backend/src/app';
import TEST_CONFIG from '../../config/test.config';

const prisma = new PrismaClient({
  datasources: { db: { url: TEST_CONFIG.database.connectionString } },
});

describe('Reports API - Real Integration Tests', () => {
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

  it('should generate payroll report', async () => {
    const response = await request(app)
      .post('/api/v1/reports/payroll')
      .set('Authorization', `Bearer ${authToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      })
      .expect(200);
    expect(response.body.success).toBe(true);
  });

  it('should export report to PDF', async () => {
    const response = await request(app)
      .get('/api/v1/reports/staff/export?format=pdf')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(response.headers['content-type']).toContain('pdf');
  });
});
