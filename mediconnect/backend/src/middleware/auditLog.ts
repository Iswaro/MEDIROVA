import { Request, Response, NextFunction } from 'express';
import { execute } from '../db/pool';
import { logger } from '../config/logger';

export interface AuditOptions {
  action: string;
  entityType?: string;
  entityId?: string;
}

/**
 * Middleware factory that records an audit log entry after the request succeeds.
 * The actual DB write is fire-and-forget to avoid blocking the response.
 */
export function auditLog(options: AuditOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown) {
      // Only log on successful responses (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id ?? null;
        const ip = req.ip ?? req.socket.remoteAddress ?? null;
        const userAgent = req.headers['user-agent'] ?? null;

        execute(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, metadata)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            options.action,
            options.entityType ?? null,
            options.entityId ?? null,
            ip,
            userAgent,
            JSON.stringify({ method: req.method, path: req.path }),
          ],
        ).catch((err: unknown) => logger.error('Audit log write failed:', err));
      }
      return originalJson(body);
    };

    next();
  };
}

/**
 * Standalone function to insert an audit record programmatically from service layer.
 */
export async function logAuditEvent(
  userId: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, action, entityType ?? null, entityId ?? null, metadata ? JSON.stringify(metadata) : null],
    );
  } catch (err) {
    logger.error('Audit log event failed:', err);
  }
}
