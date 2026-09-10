import { AppError } from './AppError';

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', errors?: unknown) {
    super(message, 404, errors);
  }
}