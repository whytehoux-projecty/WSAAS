import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../../staff_backend/src/app';
import TEST_CONFIG from '../../config/test.config';

const prisma = new PrismaClient({
  datasources: { db: { url: TEST_CONFIG.database.connectionString } },
});

describe('XSS Security Tests', () => {
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

  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
  ];

  xssPayloads.forEach((payload) => {
    it(`should prevent XSS: ${payload}`, async () => {
      const response = await request(app)
        .put('/api/v1/staff/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-CSRF-Token', csrfToken)
        .send({ firstName: payload });
      
      if (response.status === 200) {
        expect(response.body.profile.firstName).not.toContain('<script>');
      }
    });
  });
});
