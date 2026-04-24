import request from 'supertest';
import app from '../../src/app';

jest.mock('../../src/config/database', () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
    loginAuditLog: { create: jest.fn() },
    school: { findUnique: jest.fn() },
    notification: { findMany: jest.fn(), count: jest.fn() },
  },
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}));

describe('Auth API', () => {
  describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns 400 when email is missing', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ password: 'Test@1234' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 for invalid email format', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: 'not-an-email', password: 'Test@1234' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when password is missing', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: 'user@school.edu' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('returns 400 for invalid email', async () => {
      const res = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'bad' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    it('returns 400 when token is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ newPassword: 'NewPass@123' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when password is too weak', async () => {
      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ token: 'sometoken', newPassword: 'weak' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns 401 without authorization header', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 401 with malformed token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer not.a.real.token');
      expect(res.status).toBe(401);
    });
  });

  describe('Rate limiting on login', () => {
    it('applies auth rate limiter headers', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com', password: 'Test@1234' });
      expect(res.headers['ratelimit-limit']).toBeDefined();
    });
  });
});
