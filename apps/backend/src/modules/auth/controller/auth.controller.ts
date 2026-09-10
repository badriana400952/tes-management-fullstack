import { Request, Response } from 'express';
import { authService } from '../service/auth.service';
import {
  clearCookie,
  getCookie,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '../../../shared/security';
import { env } from '../../../config/env';

export class AuthController {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body, { ipAddress: req.ip });
    res.status(201).json({ success: true, data: { user } });
  }

  async login(req: Request, res: Response) {
    const { user, tokens } = await authService.login(req.body, {
      ipAddress: req.ip,
    });

    setAccessTokenCookie(res, tokens.accessToken);
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.json({ success: true, data: { user } });
  }

  async refreshToken(req: Request, res: Response) {
    const token = getCookie(req, env.REFRESH_COOKIE_NAME);
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Refresh token is missing',
      });
      return;
    }

    const { user, tokens } = await authService.refreshToken(token);

    setAccessTokenCookie(res, tokens.accessToken);
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.json({ success: true, data: { user } });
  }

  async logout(req: Request, res: Response) {
    const token = getCookie(req, env.REFRESH_COOKIE_NAME) ?? undefined;
    if (token) {
      await authService.logout(token, { ipAddress: req.ip });
    }

    clearCookie(res, env.ACCESS_COOKIE_NAME);
    clearCookie(res, env.REFRESH_COOKIE_NAME);

    res.json({ success: true, data: null });
  }

  async me(req: Request, res: Response) {
    const user = await authService.getProfile(req.user!.id);
    res.json({ success: true, data: { user } });
  }
}

export const authController = new AuthController();