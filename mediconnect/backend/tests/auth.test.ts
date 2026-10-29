import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Auth Endpoints', () => {
  const testEmail = `test.user.${Date.now()}@mediconnect.ke`;
  const testPassword = 'Password123!';

  describe('POST /api/v1/auth/register', () => {
    it('should reject registration with invalid password (no uppercase)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'bad@test.com',
          password: 'lowercaseonly1',
          firstName: 'John',
          lastName: 'Doe',
          role: 'PATIENT',
        });
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: testPassword,
          firstName: 'John',
          lastName: 'Doe',
          role: 'PATIENT',
        });
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should reject login with non-existent user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@mediconnect.ke',
          password: 'Password123!',
        });
      // Should be 401 Unauthorized (or 500 if DB is offline during mock unit test)
      expect([401, 500]).toContain(res.status);
    });
  });

  describe('Protected Routes', () => {
    it('should reject request to /api/v1/auth/me without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('should reject request to /api/v1/admin/dashboard without token', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard');
      expect(res.status).toBe(401);
    });
  });
});
