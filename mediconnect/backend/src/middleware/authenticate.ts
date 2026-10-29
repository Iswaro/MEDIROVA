import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler';

export type Role = 'PATIENT' | 'PROVIDER' | 'ADMIN' | 'SUPPORT';

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  type: 'access' | 'refresh';
}

// Augment Express Request
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Verifies JWT access token from Authorization: Bearer <token> header.
 * Attaches req.user = { id, role, email }.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No access token provided', 401);
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtPayload;

    if (payload.type !== 'access') {
      throw new AppError('Invalid token type', 401);
    }

    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    if (err instanceof jwt.TokenExpiredError) return next(new AppError('Access token expired', 401));
    if (err instanceof jwt.JsonWebTokenError) return next(new AppError('Invalid access token', 401));
    next(err);
  }
}
