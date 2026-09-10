import { AppError } from './AppError';

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', errors?: unknown) {
    super(message, 500, errors);
  }
}