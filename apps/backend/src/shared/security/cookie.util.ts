import { CookieOptions, Request, Response } from 'express';
import { env } from '../../config/env';

export function parseDurationToMs(value: string): number {
  const match = /^(\d+)(ms|s|m|h|d|w)$/.exec(value.trim());
  if (!match) throw new Error(`Invalid duration format: ${value}`);
  const amount = Number.parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };
  return amount * multipliers[unit];
}

const secure = env.COOKIE_SECURE || env.NODE_ENV === 'production';

function baseOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  };
}

export const ACCESS_TOKEN_COOKIE_MAX_AGE = parseDurationToMs(
  env.JWT_ACCESS_EXPIRES_IN,
);
export const REFRESH_TOKEN_COOKIE_MAX_AGE = parseDurationToMs(
  env.JWT_REFRESH_EXPIRES_IN,
);

export function getCookie(req: Request, name: string): string | undefined {
  return req.cookies?.[name];
}

export function setCookie(
  res: Response,
  name: string,
  value: string,
  maxAgeMs: number,
): void {
  res.cookie(name, value, baseOptions(maxAgeMs));
}

export function setAccessTokenCookie(res: Response, token: string): void {
  setCookie(res, env.ACCESS_COOKIE_NAME, token, ACCESS_TOKEN_COOKIE_MAX_AGE);
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  setCookie(res, env.REFRESH_COOKIE_NAME, token, REFRESH_TOKEN_COOKIE_MAX_AGE);
}

export function clearCookie(res: Response, name: string): void {
  res.clearCookie(name, { httpOnly: true, sameSite: 'lax', secure, path: '/' });
}