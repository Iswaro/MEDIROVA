import { Request, Response, NextFunction } from 'express';
import { config } from '../../config/env';
import * as authService from './auth.service';
import { AppError } from '../../middleware/errorHandler';

const REFRESH_COOKIE = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export async function registerController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.register(req.body);
    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { accessToken: result.accessToken, userId: result.userId },
    });
  } catch (err) {
    next(err);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken: result.accessToken,
        userId: result.userId,
        role: result.role,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token =
      (req.cookies as Record<string, string>)?.[REFRESH_COOKIE] ??
      (req.body as { refreshToken?: string })?.refreshToken;
    if (!token) throw new AppError('No refresh token provided', 401);

    const tokens = await authService.refresh(token);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOptions);
    res.json({
      success: true,
      message: 'Tokens refreshed',
      data: { accessToken: tokens.accessToken },
    });
  } catch (err) {
    next(err);
  }
}

export async function logoutController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token =
      (req.cookies as Record<string, string>)?.[REFRESH_COOKIE] ??
      (req.body as { refreshToken?: string })?.refreshToken;
    if (token) await authService.logout(token);
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function meController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const user = await authService.getCurrentUser(req.user.id);
    res.json({ success: true, message: 'User profile', data: user });
  } catch (err) {
    next(err);
  }
}
