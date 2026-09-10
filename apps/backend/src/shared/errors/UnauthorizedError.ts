import { AppError } from './AppError';

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', errors?: unknown) {
    super(message, 401, errors);
  }
}