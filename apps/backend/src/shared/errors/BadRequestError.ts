import { AppError } from './AppError';

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors?: unknown) {
    super(message, 400, errors);
  }
}