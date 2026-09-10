import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Express } from 'express';
import { User } from '@prisma/client';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';
import { env } from '../../src/config/env';
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
} from '../../src/shared/security';

const request = require('supertest') as typeof import('supertest');

const mockOf = (fn: unknown): any => fn;

describe('Auth API (integration)', () => {
  let app: Express;

  const baseUser: User = {
    id: 'user-1',
    email: 'alice@example.com',
    name: 'Alice',
    role: 'USER',
    passwordHash: '',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  async function userWithPassword(): Promise<User> {
    const passwordHash = await hashPassword('password123');
    return { ...baseUser, passwordHash };
  }

  function accessCookie(token: string): string {
    return `${env.ACCESS_COOKIE_NAME}=${token}`;
  }

  function refreshCookie(token: string): string {
    return `${env.REFRESH_COOKIE_NAME}=${token}`;
  }

  function setCookieHeader(res: { headers: Record<string, unknown> }): string[] {
    const value = res.headers['set-cookie'];
    return Array.isArray(value) ? value : [String(value)];
  }

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    mockOf(prisma.auditLog.create).mockResolvedValue(undefined);
    mockOf(prisma.refreshToken.create).mockResolvedValue(undefined);
    mockOf(prisma.refreshToken.update).mockResolvedValue(undefined);
  });

  describe('POST /auth/register', () => {
    it('creates a user and returns 201 with profile', async () => {
      const created = { ...baseUser, passwordHash: 'hashed-value' };
      mockOf(prisma.user.findUnique).mockResolvedValue(null);
      mockOf(prisma.user.create).mockResolvedValue(created);

      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'alice@example.com',
        name: 'Alice',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toMatchObject({
        id: 'user-1',
        email: 'alice@example.com',
        name: 'Alice',
      });
      expect(res.body.data.user).not.toHaveProperty('passwordHash');

      const userCreated = mockOf(prisma.user.create).mock.calls[0][0];
      expect(userCreated.data.email).toBe('alice@example.com');
      expect(userCreated.data.passwordHash).not.toBe('password123');
    });

    it('returns 409 when email already exists', async () => {
      mockOf(prisma.user.findUnique).mockResolvedValue(baseUser);

      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'alice@example.com',
        name: 'Alice',
        password: 'password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(mockOf(prisma.user.create)).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid payload', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', name: 'A', password: 'x' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    it('returns tokens and sets httpOnly cookies', async () => {
      mockOf(prisma.user.findUnique).mockResolvedValue(await userWithPassword());

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'alice@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.user.id).toBe('user-1');

      const cookies = setCookieHeader(res);
      const joined = cookies.join('; ');
      expect(joined).toContain(`${env.ACCESS_COOKIE_NAME}=`);
      expect(joined).toContain(`${env.REFRESH_COOKIE_NAME}=`);
      expect(joined).toContain('HttpOnly');
    });

    it('returns 401 for wrong password', async () => {
      mockOf(prisma.user.findUnique).mockResolvedValue(await userWithPassword());

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'alice@example.com',
        password: 'wrong-pass',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('returns 401 for unknown email', async () => {
      mockOf(prisma.user.findUnique).mockResolvedValue(null);

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'ghost@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns the profile when authenticated via cookie', async () => {
      const token = generateAccessToken({
        id: 'user-1',
        email: 'alice@example.com',
        role: 'USER',
      });
      mockOf(prisma.user.findUnique).mockResolvedValue(baseUser);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', accessCookie(token));

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe('Alice');
    });

    it('returns 401 for a tampered token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', accessCookie('not-a-real-token'));

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('rotates the refresh token', async () => {
      const oldRefresh = generateRefreshToken('user-1', 'jti-1');
      mockOf(prisma.refreshToken.findUnique).mockResolvedValue({
        token: 'jti-1',
        userId: 'user-1',
        revoked: false,
        expiresAt: new Date(Date.now() + 60_000),
      });
      mockOf(prisma.user.findUnique).mockResolvedValue(baseUser);

      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .set('Cookie', refreshCookie(oldRefresh));

      expect(res.status).toBe(200);
      expect(res.body.data.user.id).toBe('user-1');

      const refreshed = setCookieHeader(res)
        .join('; ')
        .match(new RegExp(`${env.REFRESH_COOKIE_NAME}=([^;]+)`))?.[1];
      expect(refreshed).toBeTruthy();
      expect(refreshed).not.toBe(oldRefresh);
    });

    it('returns 401 when the token has been revoked', async () => {
      const oldRefresh = generateRefreshToken('user-1', 'jti-2');
      mockOf(prisma.refreshToken.findUnique).mockResolvedValue({
        token: 'jti-2',
        userId: 'user-1',
        revoked: true,
        expiresAt: new Date(Date.now() + 60_000),
      });

      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .set('Cookie', refreshCookie(oldRefresh));

      expect(res.status).toBe(401);
    });

    it('returns 401 without a refresh cookie', async () => {
      const res = await request(app).post('/api/v1/auth/refresh-token');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Refresh token is missing');
    });
  });

  describe('POST /auth/logout', () => {
    it('revokes the refresh token and clears cookies', async () => {
      const refresh = generateRefreshToken('user-1', 'jti-3');
      mockOf(prisma.refreshToken.findUnique).mockResolvedValue({
        token: 'jti-3',
        userId: 'user-1',
        revoked: false,
        expiresAt: new Date(Date.now() + 60_000),
      });

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', refreshCookie(refresh));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockOf(prisma.refreshToken.update)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { token: 'jti-3' },
          data: { revoked: true },
        }),
      );

      const cookies = setCookieHeader(res).join('; ');
      expect(cookies).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/);
    });
  });
});