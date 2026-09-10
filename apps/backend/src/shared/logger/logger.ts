import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { env } from '../../config/env';

const logDirectory = path.join(process.cwd(), 'logs');

fs.mkdirSync(logDirectory, { recursive: true });

const formatForConsole = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    const context = requestId ? ` [req=${requestId}]` : '';
    const extra =
      meta && Object.keys(meta).length > 0
        ? ` ${JSON.stringify(meta)}`
        : '';
    return `${timestamp} ${level}${context}: ${message}${extra}`;
  }),
);

const formatForFile = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: formatForFile,
  transports: [
    new winston.transports.Console({
      format:
        env.NODE_ENV === 'production' ? formatForFile : formatForConsole,
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, 'combined.log'),
      maxsize: 20 * 1024 * 1024,
      maxFiles: 10,
    }),
  ],
});

export function getRequestLogger(requestId?: string): winston.Logger {
  return requestId ? logger.child({ requestId }) : logger;
}