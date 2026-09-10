import { randomUUID } from 'crypto';
import { User } from '@prisma/client';
import { authRepository, AuthRepository } from '../repository/auth.repository';
import { LoginInput, RegisterInput } from '../schema/auth.schema';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../../shared/errors';
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
  verifyRefreshToken,
} from '../../../shared/security';
import { AuditActions, AuditEntity, auditService } from '../../audit/service/audit.service';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: User['role'];
  createdAt: Date;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ServiceContext {
  ipAddress?: string;
}

export interface AuthResult {
  user: UserProfile;
  tokens: TokenPair;
}

function toProfile(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export class AuthService {
  constructor(private readonly repository: AuthRepository = authRepository) {}

  async register(payload: RegisterInput, context?: ServiceContext): Promise<UserProfile> {
    const existing = await this.repository.findUserByEmail(payload.email);
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    const passwordHash = await hashPassword(payload.password);
    const user = await this.repository.createUser({
      email: payload.email,
      name: payload.name,
      passwordHash,
    });

    await auditService.record(
      AuditActions.USER_REGISTER,
      AuditEntity.USER,
      user.id,
      { userId: user.id, ipAddress: context?.ipAddress },
      { email: user.email },
    );

    return toProfile(user);
  }

  async login(payload: LoginInput, context?: ServiceContext): Promise<AuthResult> {
    const user = await this.repository.findUserByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatches = await comparePassword(
      payload.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.issueTokenPair(user);

    await auditService.record(
      AuditActions.USER_LOGIN,
      AuditEntity.AUTH,
      user.id,
      { userId: user.id, ipAddress: context?.ipAddress },
    );

    return { user: toProfile(user), tokens };
  }

  async refreshToken(token: string): Promise<AuthResult> {
    const payload = verifyRefreshToken(token);

    const record = await this.repository.findRefreshToken(payload.jti);
    if (!record || record.revoked || record.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await this.repository.findUserById(record.userId);
    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    await this.repository.revokeRefreshToken(record.token);

    const tokens = await this.issueTokenPair(user);
    return { user: toProfile(user), tokens };
  }

  async logout(token: string, context?: ServiceContext): Promise<void> {
    if (!token) return;
    const payload = verifyRefreshToken(token);
    const record = await this.repository.findRefreshToken(payload.jti);
    if (record && !record.revoked) {
      await this.repository.revokeRefreshToken(record.token);
      await auditService.record(
        AuditActions.USER_LOGOUT,
        AuditEntity.AUTH,
        record.userId,
        { userId: record.userId, ipAddress: context?.ipAddress },
      );
    }
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return toProfile(user);
  }

  private async issueTokenPair(user: User): Promise<TokenPair> {
    const tokenId = randomUUID();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_COOKIE_MAX_AGE);

    await this.repository.createRefreshToken({
      token: tokenId,
      userId: user.id,
      expiresAt,
    });

    return {
      accessToken: generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      }),
      refreshToken: generateRefreshToken(user.id, tokenId),
    };
  }
}

export const authService = new AuthService();
