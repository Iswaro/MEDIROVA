import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';

/**
 * Typed application error class.
 * isOperational = true means it's a known/expected error (4xx).
 * isOperational = false means it's an unexpected error (5xx).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode = 500, isOperational = true, code?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Consistent JSON response shape:
 * { success, data, message, meta? }
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: Record<string, string[]>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors → 422
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.') || 'root';
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    } as ApiResponse);
    return;
  }

  // Known operational errors
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.code && { code: err.code }),
    } as ApiResponse);
    return;
  }

  // Unknown / programming errors
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
  } as ApiResponse);
}

export const errorHandler = globalErrorHandler;

