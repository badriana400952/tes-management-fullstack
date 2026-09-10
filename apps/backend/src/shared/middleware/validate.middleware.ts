import { NextFunction, Request, RequestHandler, Response } from 'express';
import { z } from 'zod';
import { BadRequestError } from '../errors';

export type ValidationTarget = 'body' | 'query' | 'params';

export function validate<T>(
  schema: z.ZodType<T>,
  targets: ValidationTarget[] = ['body'],
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      for (const target of targets) {
        const result = schema.safeParse(req[target]);
        if (!result.success) {
          throw new BadRequestError('Validation failed', {
            issues: result.error.issues,
          });
        }
        Object.defineProperty(req, target, {
          value: result.data,
          configurable: true,
          writable: true,
          enumerable: true,
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}