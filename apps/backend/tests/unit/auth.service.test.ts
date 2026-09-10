import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Prisma, User } from '@prisma/client';
import {
  AuthRepository,
  CreateRefreshTokenInput,
} from '../../src/modules/auth/repository/auth.repository';
import { AuthService } from '../../src/modules/auth/service/auth.service';
import { hashPassword } from '../../src/shared/security';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../src/shared/errors';

describe('AuthService', () => {
  const mockRepository = {
    findUserByEmail: jest.fn<(email: string) => Promise<User | null>>(),
    findUserById: jest.fn<(id: string) => Promise<User | null>>(),
    createUser: jest.fn<(data: Prisma.UserCreateInput) => Promise<User>>(),
    createRefreshToken: jest.fn<(data: CreateRefreshTokenInput) => Promise<void>>(),
    findRefreshToken: jest.fn<
      (token: string) => Promise<{
        token: string;
        userId: string;
        revoked: boolean;
        expiresAt: Date;
      } | null>
    >(),
    revokeRefreshToken: jest.fn<(token: string) => Promise<void>>(),
  };

  const service = new AuthService(mockRepository as unknown as AuthRepository);

  const baseUser: User = {
    id: 'user-1',
    email: 'alice@example.com',
    name: 'Alice',
    role: 'USER',
    passwordHash: '',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates user with a hashed password and returns profile', async () => {
      const created = { ...baseUser, passwordHash: 'hash123' };
      mockRepository.findUserByEmail.mockResolvedValue(null);
      mockRepository.createUser.mockResolvedValue(created);

      const profile = await service.register({
        email: 'alice@example.com',
        name: 'Alice',
        password: 'password123',
      });

      expect(mockRepository.findUserByEmail).toHaveBeenCalledWith('alice@example.com');
      const createArgs = mockRepository.createUser.mock.calls[0][0];
      expect(createArgs.email).toBe('alice@example.com');
      expect(createArgs.name).toBe('Alice');
      expect(createArgs.passwordHash).not.toBe('password123');

      expect(profile).toMatchObject({
        id: 'user-1',
        email: 'alice@example.com',
        name: 'Alice',
        role: 'USER',
      });
      expect(profile).not.toHaveProperty('passwordHash');
    });

    it('throws ConflictError when email is already registered', async () => {
      mockRepository.findUserByEmail.mockResolvedValue(baseUser);

      await expect(
        service.register({ email: 'alice@example.com', name: 'Alice', password: 'password123' }),
      ).rejects.toBeInstanceOf(ConflictError);
      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns user profile and token pair for valid credentials', async () => {
      const passwordHash = await hashPassword('password123');
      const user = { ...baseUser, passwordHash };
      mockRepository.findUserByEmail.mockResolvedValue(user);
      mockRepository.createRefreshToken.mockResolvedValue(undefined);

      const result = await service.login({ email: 'alice@example.com', password: 'password123' });

      expect(result.user.id).toBe('user-1');
      expect(typeof result.tokens.accessToken).toBe('string');
      expect(typeof result.tokens.refreshToken).toBe('string');
      expect(mockRepository.createRefreshToken).toHaveBeenCalledTimes(1);
    });

    it('throws UnauthorizedError for unknown email', async () => {
      mockRepository.findUserByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'password123' }),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it('throws UnauthorizedError for wrong password', async () => {
      const passwordHash = await hashPassword('password123');
      mockRepository.findUserByEmail.mockResolvedValue({
        ...baseUser,
        passwordHash,
      });

      await expect(
        service.login({ email: 'alice@example.com', password: 'WRONG-password' }),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });
  });

  describe('getProfile', () => {
    it('returns profile when user exists', async () => {
      mockRepository.findUserById.mockResolvedValue(baseUser);

      const profile = await service.getProfile('user-1');
      expect(profile.id).toBe('user-1');
    });

    it('throws NotFoundError when user does not exist', async () => {
      mockRepository.findUserById.mockResolvedValue(null);

      await expect(service.getProfile('nope')).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('refreshToken', () => {
    const { generateRefreshToken } = require('../../src/shared/security');
    const validToken = generateRefreshToken('user-1', 'jti-1');

    it('rotates the refresh token', async () => {
      mockRepository.findRefreshToken.mockResolvedValue({
        token: 'jti-1',
        userId: 'user-1',
        revoked: false,
        expiresAt: new Date(Date.now() + 60_000),
      });
      mockRepository.findUserById.mockResolvedValue(baseUser);
      mockRepository.revokeRefreshToken.mockResolvedValue(undefined);
      mockRepository.createRefreshToken.mockResolvedValue(undefined);

      const result = await service.refreshToken(validToken);

      expect(mockRepository.revokeRefreshToken).toHaveBeenCalledWith('jti-1');
      expect(mockRepository.createRefreshToken).toHaveBeenCalledTimes(1);
      expect(result.user.id).toBe('user-1');
      expect(result.tokens.refreshToken).not.toBe(validToken);
    });

    it('throws UnauthorizedError when record is revoked', async () => {
      mockRepository.findRefreshToken.mockResolvedValue({
        token: 'jti-1',
        userId: 'user-1',
        revoked: true,
        expiresAt: new Date(Date.now() + 60_000),
      });

      await expect(service.refreshToken(validToken)).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it('throws UnauthorizedError when record is missing', async () => {
      mockRepository.findRefreshToken.mockResolvedValue(null);

      await expect(service.refreshToken(validToken)).rejects.toBeInstanceOf(UnauthorizedError);
    });
  });

  describe('logout', () => {
    it('revokes the refresh token when valid', async () => {
      const { generateRefreshToken } = require('../../src/shared/security');
      const validToken = generateRefreshToken('user-1', 'jti-2');
      mockRepository.findRefreshToken.mockResolvedValue({
        token: 'jti-2',
        userId: 'user-1',
        revoked: false,
        expiresAt: new Date(Date.now() + 60_000),
      });
      mockRepository.revokeRefreshToken.mockResolvedValue(undefined);

      await service.logout(validToken, { ipAddress: '127.0.0.1' });

      expect(mockRepository.revokeRefreshToken).toHaveBeenCalledWith('jti-2');
    });

    it('does nothing when no token is provided', async () => {
      await service.logout('');

      expect(mockRepository.findRefreshToken).not.toHaveBeenCalled();
      expect(mockRepository.revokeRefreshToken).not.toHaveBeenCalled();
    });
  });
});