import { Request, Response, NextFunction } from 'express';
import { Role } from './authenticate';
import { AppError } from './errorHandler';

/**
 * Role-based access control middleware factory.
 * Usage: authorize(['ADMIN', 'SUPPORT'])
 */
export function authorize(roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
}
