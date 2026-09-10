import { AppError } from './AppError';

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', errors?: unknown) {
    super(message, 403, errors);
  }
}