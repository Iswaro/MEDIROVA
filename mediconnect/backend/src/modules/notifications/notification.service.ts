import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';
import { query, execute } from '../../db/pool';
import { getIO } from '../../sockets';
import { logger } from '../../config/logger';

export interface SendNotificationParams {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function sendNotification(params: SendNotificationParams): Promise<string> {
  const id = uuidv4();
  await execute(
    `INSERT INTO notifications (id, user_id, type, title, body, data)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, params.userId, params.type, params.title, params.body, params.data ? JSON.stringify(params.data) : null],
  );

  // Live Socket.IO push
  try {
    const io = getIO();
    io.to(`user:${params.userId}`).emit('notification:new', {
      id,
      type: params.type,
      title: params.title,
      body: params.body,
      data: params.data,
      created_at: new Date().toISOString(),
    });
  } catch {
    /* socket not available */
  }

  logger.info(`[Notification] ${params.type} sent to ${params.userId}: ${params.title}`);
  return id;
}

export async function getUserNotifications(userId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const notifications = await query<RowDataPacket>(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, limit, offset],
  );

  const [count] = await query<RowDataPacket>(
    'SELECT COUNT(*) AS total, SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) AS unread FROM notifications WHERE user_id = ?',
    [userId],
  );

  return {
    notifications,
    total: Number(count?.total ?? 0),
    unread: Number(count?.unread ?? 0),
    page,
    limit,
  };
}

export async function markNotificationAsRead(id: string, userId: string): Promise<void> {
  await execute(
    'UPDATE notifications SET is_read = TRUE, read_at = UTC_TIMESTAMP() WHERE id = ? AND user_id = ?',
    [id, userId],
  );
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await execute(
    'UPDATE notifications SET is_read = TRUE, read_at = UTC_TIMESTAMP() WHERE user_id = ? AND is_read = FALSE',
    [userId],
  );
}
