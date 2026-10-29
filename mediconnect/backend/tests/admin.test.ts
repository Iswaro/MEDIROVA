import jwt from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Role-Based Access Control (Admin Routes)', () => {
  const secret = process.env.JWT_ACCESS_SECRET || 'test_jwt_access_secret_which_is_at_least_32_characters_long!';

  const patientToken = jwt.sign(
    { id: 'patient-uuid', email: 'pat@mediconnect.ke', role: 'PATIENT', type: 'access' },
    secret,
  );

  const adminToken = jwt.sign(
    { id: 'admin-uuid', email: 'admin@mediconnect.ke', role: 'ADMIN', type: 'access' },
    secret,
  );

  it('rejects patient trying to access admin dashboard with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('rejects unauthenticated request to admin route with 401', async () => {
    const res = await request(app).get('/api/v1/admin/dashboard');
    expect(res.status).toBe(401);
  });
});
