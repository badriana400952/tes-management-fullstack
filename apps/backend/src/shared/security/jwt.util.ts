import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { Role } from '@prisma/client';
import { UnauthorizedError } from '../errors';

const accessExpiry = env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'];
const refreshExpiry = env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'];

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
  jti: string;
}

interface TokenSubject {
  id: string;
  email: string;
  role: Role;
}

export function generateAccessToken(user: TokenSubject): string {
  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    type: 'access',
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: accessExpiry,
  } satisfies SignOptions);
}

export function generateRefreshToken(
  userId: string,
  tokenId: string,
): string {
  const payload: RefreshTokenPayload = {
    sub: userId,
    type: 'refresh',
    jti: tokenId,
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: refreshExpiry,
  } satisfies SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
    if (decoded.type !== 'access' || typeof decoded.sub !== 'string') {
      throw new UnauthorizedError('Invalid access token');
    }
    return {
      sub: decoded.sub,
      email: decoded.email as string,
      role: decoded.role as Role,
      type: 'access',
    };
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
    if (decoded.type !== 'refresh' || typeof decoded.sub !== 'string' || typeof decoded.jti !== 'string') {
      throw new UnauthorizedError('Invalid refresh token');
    }
    return {
      sub: decoded.sub,
      type: 'refresh',
      jti: decoded.jti,
    };
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}