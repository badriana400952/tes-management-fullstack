import { AppError } from './AppError';

export class ConflictError extends AppError {
  constructor(message = 'Conflict', errors?: unknown) {
    super(message, 409, errors);
  }
}