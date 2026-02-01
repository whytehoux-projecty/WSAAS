import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../../staff_backend/src/app';
import TEST_CONFIG from '../../config/test.config';

const prisma = new PrismaClient({
  datasources: { db: { url: TEST_CONFIG.database.connectionString } },
});

describe('Documents API - Real Integration Tests', () => {
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

  it('should upload document with real file', async () => {
    const fileContent = Buffer.from('Test document content');
    const response = await request(app)
      .post('/api/v1/documents/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .set('X-CSRF-Token', csrfToken)
      .attach('file', fileContent, 'test.pdf')
      .field('title', 'Test Document')
      .expect(201);
    expect(response.body.success).toBe(true);
  });

  it('should list documents from database', async () => {
    const response = await request(app)
      .get('/api/v1/documents')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.documents)).toBe(true);
  });

  it('should download document', async () => {
    const listResponse = await request(app)
      .get('/api/v1/documents?limit=1')
      .set('Authorization', `Bearer ${authToken}`);
    if (listResponse.body.documents.length > 0) {
      const docId = listResponse.body.documents[0].id;
      const response = await request(app)
        .get(`/api/v1/documents/${docId}/download`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(response.body.length).toBeGreaterThan(0);
    }
  });
});
