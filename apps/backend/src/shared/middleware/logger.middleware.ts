import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import { getRequestLogger, logger } from '../logger/logger';

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();
  const requestId = req.headers['x-request-id']?.toString() ?? randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const durationMs =
      Number(process.hrtime.bigint() - start) / 1_000_000;
    const log = getRequestLogger(requestId);
    log.http(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(2)}ms`,
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs),
        ip: req.ip,
      },
    );
  });

  res.on('close', () => {
    logger.debug('Request closed', {
      method: req.method,
      url: req.originalUrl,
    });
  });

  next();
};