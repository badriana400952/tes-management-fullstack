import { RequestHandler } from 'express';
import { TooManyRequestsError } from '../errors';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Parameters<RequestHandler>[0]) => string;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimit(options: RateLimitOptions): RequestHandler {
  const { windowMs, max } = options;
  const message =
    options.message ?? 'Too many requests, please try again later';
  const keyGenerator = options.keyGenerator ?? generateDefaultKey;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    let entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count += 1;

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader(
      'X-RateLimit-Remaining',
      String(Math.max(0, max - entry.count)),
    );

    if (entry.count > max) {
      res.setHeader(
        'Retry-After',
        String(Math.ceil((entry.resetAt - now) / 1000)),
      );
      next(new TooManyRequestsError(message));
      return;
    }

    next();
  };
}

function generateDefaultKey(
  req: Parameters<RequestHandler>[0],
): string {
  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  return `${ip}:${req.method}:${req.path}`;
}