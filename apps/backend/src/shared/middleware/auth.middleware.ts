import { RequestHandler } from 'express';
import { env } from '../../config/env';
import { getCookie } from '../security/cookie.util';
import { verifyAccessToken } from '../security/jwt.util';
import { UnauthorizedError } from '../errors';

function extractBearerToken(authorization?: string): string | null {
  if (!authorization) return null;
  const [scheme, token] = authorization.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export const authenticate: RequestHandler = (req, _res, next) => {
  try {
    const cookieToken = getCookie(req, env.ACCESS_COOKIE_NAME);
    const bearerToken = extractBearerToken(req.headers.authorization);
    const token = cookieToken ?? bearerToken;

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (err) {
    next(err);
  }
};