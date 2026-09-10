import { AppError } from './AppError';

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests, please try again later', errors?: unknown) {
    super(message, 429, errors);
  }
}