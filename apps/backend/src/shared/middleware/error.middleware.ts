import { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { env } from '../../config/env';
import {
  AppError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../errors';
import { getRequestLogger } from '../logger/logger';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    new NotFoundError(
      `Route not found: ${req.method} ${req.originalUrl}`,
    ),
  );
};

function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): AppError {
  switch (err.code) {
    case 'P2002':
      return new ConflictError(
        `A record with the same ${err.meta?.target as string} already exists`,
      );
    case 'P2025':
      return new NotFoundError('Record not found');
    case 'P2003':
      return new ConflictError('Related record does not exist');
    default:
      return new InternalServerError();
  }
}

function normalizeError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof ZodError) {
    return new BadRequestError('Validation failed', { issues: err.issues });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return mapPrismaError(err);
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return new BadRequestError('Invalid database query', {
      message: err.message,
    });
  }

  return new InternalServerError();
}

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  // next must be present for Express to recognize the error handler signature
  _next,
) => {
  const error = normalizeError(err);
  const isOperational = error.isOperational;
  const requestLogger = getRequestLogger(req.requestId);

  if (!isOperational || error.statusCode >= 500) {
    requestLogger.error(error.message, {
      method: req.method,
      url: req.originalUrl,
      statusCode: error.statusCode,
      error: err instanceof Error ? err.stack : err,
    });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.errors !== undefined ? { errors: error.errors } : {}),
    requestId: req.requestId,
    ...(env.NODE_ENV === 'development' && err instanceof Error
      ? { stack: err.stack?.split('\n') }
      : {}),
  });
};