import { Router } from 'express';
import { authController } from './controller/auth.controller';
import { loginSchema, registerSchema } from './schema/auth.schema';
import { authenticate, rateLimit, validate } from '../../shared/middleware';

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later',
});

const refreshRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
});

const authRouter = Router();

authRouter.post(
  '/register',
  validate(registerSchema),
  authController.register,
);

authRouter.post(
  '/login',
  loginRateLimit,
  validate(loginSchema),
  authController.login,
);

authRouter.post(
  '/refresh-token',
  refreshRateLimit,
  authController.refreshToken,
);

authRouter.post('/logout', authController.logout);

authRouter.get('/me', authenticate, authController.me);

export default authRouter;