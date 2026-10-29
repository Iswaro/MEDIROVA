import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/errorHandler';
import { query, execute } from '../../db/pool';

const router = Router();

router.use(authenticate);

const createTicketSchema = z.object({
  subject: z.string().min(5).max(500),
  description: z.string().min(10),
  bookingId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

// Any authenticated user can create a support ticket
router.post('/', validate(createTicketSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const data = req.body as z.infer<typeof createTicketSchema>;
    const id = uuidv4();

    const isPatient = req.user.role === 'PATIENT';
    const isProvider = req.user.role === 'PROVIDER';

    await execute(
      `INSERT INTO support_tickets (
        id, patient_user_id, provider_user_id, booking_id, subject, description, priority, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
      [
        id,
        isPatient ? req.user.id : null,
        isProvider ? req.user.id : null,
        data.bookingId ?? null,
        data.subject,
        data.description,
        data.priority,
      ],
    );

    res.status(201).json({ success: true, message: 'Ticket submitted', data: { id } });
  } catch (err) {
    next(err);
  }
});

// Get tickets: ADMIN & SUPPORT see all; users see own
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { role, id: userId } = req.user;
    let sql: string;
    let params: unknown[];

    if (role === 'ADMIN' || role === 'SUPPORT') {
      sql = `SELECT st.*, u.email AS creator_email
             FROM support_tickets st
             LEFT JOIN users u ON u.id = COALESCE(st.patient_user_id, st.provider_user_id)
             ORDER BY st.created_at DESC`;
      params = [];
    } else {
      sql = `SELECT * FROM support_tickets
             WHERE patient_user_id = ? OR provider_user_id = ?
             ORDER BY created_at DESC`;
      params = [userId, userId];
    }

    const tickets = await query<RowDataPacket>(sql, params);
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
});

// Update ticket status (SUPPORT or ADMIN)
router.patch(
  '/:id',
  authorize(['ADMIN', 'SUPPORT']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, priority, assignedToUserId } = req.body;
      await execute(
        `UPDATE support_tickets
         SET status = COALESCE(?, status),
             priority = COALESCE(?, priority),
             assigned_to_user_id = COALESCE(?, assigned_to_user_id),
             resolved_at = CASE WHEN ? = 'RESOLVED' THEN UTC_TIMESTAMP() ELSE resolved_at END,
             updated_at = UTC_TIMESTAMP()
         WHERE id = ?`,
        [status ?? null, priority ?? null, assignedToUserId ?? null, status, req.params.id],
      );
      res.json({ success: true, message: 'Ticket updated' });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
