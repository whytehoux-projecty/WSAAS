import request from 'supertest';
import app from '../../../staff_backend/src/app';

describe('CSRF Security Tests', () => {
  it('should reject request without CSRF token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@test.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(403);
    
    expect(response.body.success).toBe(false);
  });

  it('should accept request with valid CSRF token', async () => {
    const csrfResponse = await request(app).get('/api/v1/csrf-token');
    const csrfToken = csrfResponse.body.csrfToken;

    const response = await request(app)
      .post('/api/v1/auth/register')
      .set('X-CSRF-Token', csrfToken)
      .send({
        email: `test.${Date.now()}@test.com`,
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });
    
    expect([201, 400]).toContain(response.status);
  });
});
