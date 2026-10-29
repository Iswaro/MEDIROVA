import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './errorHandler';

type ValidationTarget = 'body' | 'params' | 'query';

/**
 * Validates req.body / req.params / req.query against a Zod schema.
 * On failure throws ZodError which globalErrorHandler converts to 422.
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const source = req[target];
      const parsed = schema.parse(source);
      // Replace with parsed (strips unknown fields)
      (req as unknown as Record<string, unknown>)[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(err);
      }
      next(new AppError('Validation error', 422));
    }
  };
}
