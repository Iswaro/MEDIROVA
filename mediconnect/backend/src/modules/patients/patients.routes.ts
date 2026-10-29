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

router.use(authenticate, authorize(['PATIENT']));

// ─── Schemas ──────────────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{7,14}$/).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  emergencyContactName: z.string().max(200).optional(),
  emergencyContactPhone: z.string().regex(/^\+?[1-9]\d{7,14}$/).optional(),
});

const addressSchema = z.object({
  label: z.string().min(1).max(100).default('Home'),
  addressLine: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isDefault: z.boolean().default(false),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

/** GET /api/v1/patients/profile */
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [profile] = await query<RowDataPacket>(
      `SELECT u.id AS user_id, u.email, u.phone, u.created_at,
              pp.id AS profile_id, pp.first_name, pp.last_name, pp.date_of_birth,
              pp.gender, pp.profile_photo_url, pp.emergency_contact_name, pp.emergency_contact_phone
       FROM users u
       LEFT JOIN patient_profiles pp ON pp.user_id = u.id
       WHERE u.id = ?`,
      [req.user!.id],
    );
    if (!profile) throw new AppError('Profile not found', 404);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

/** PATCH /api/v1/patients/profile */
router.patch('/profile', validate(updateProfileSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, phone, dateOfBirth, gender, emergencyContactName, emergencyContactPhone } =
      req.body as z.infer<typeof updateProfileSchema>;

    if (phone) {
      await execute('UPDATE users SET phone = ?, updated_at = UTC_TIMESTAMP() WHERE id = ?', [
        phone,
        req.user!.id,
      ]);
    }

    await execute(
      `UPDATE patient_profiles
       SET first_name = COALESCE(?, first_name),
           last_name = COALESCE(?, last_name),
           date_of_birth = COALESCE(?, date_of_birth),
           gender = COALESCE(?, gender),
           emergency_contact_name = COALESCE(?, emergency_contact_name),
           emergency_contact_phone = COALESCE(?, emergency_contact_phone),
           updated_at = UTC_TIMESTAMP()
       WHERE user_id = ?`,
      [
        firstName ?? null,
        lastName ?? null,
        dateOfBirth ? new Date(dateOfBirth) : null,
        gender ?? null,
        emergencyContactName ?? null,
        emergencyContactPhone ?? null,
        req.user!.id,
      ],
    );

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
});

/** GET /api/v1/patients/bookings */
router.get('/bookings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const bookings = await query<RowDataPacket>(
      `SELECT b.*,
              sc.name AS category_name,
              prov.first_name AS provider_first_name,
              prov.last_name AS provider_last_name,
              prov.provider_type,
              prov.average_rating
       FROM bookings b
       JOIN service_categories sc ON sc.id = b.category_id
       LEFT JOIN provider_profiles prov ON prov.id = b.provider_id
       WHERE b.patient_user_id = ?
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user!.id, limit, offset],
    );

    const [count] = await query<RowDataPacket>(
      'SELECT COUNT(*) AS total FROM bookings WHERE patient_user_id = ?',
      [req.user!.id],
    );

    res.json({
      success: true,
      data: bookings,
      meta: { total: Number(count?.total ?? 0), page, limit },
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/v1/patients/addresses */
router.get('/addresses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addresses = await query<RowDataPacket>(
      'SELECT * FROM patient_addresses WHERE patient_user_id = ? ORDER BY is_default DESC, created_at DESC',
      [req.user!.id],
    );
    res.json({ success: true, data: addresses });
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/patients/addresses */
router.post('/addresses', validate(addressSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as z.infer<typeof addressSchema>;

    if (data.isDefault) {
      await execute('UPDATE patient_addresses SET is_default = FALSE WHERE patient_user_id = ?', [
        req.user!.id,
      ]);
    }

    const id = uuidv4();
    await execute(
      `INSERT INTO patient_addresses (id, patient_user_id, label, address_line, latitude, longitude, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user!.id, data.label, data.addressLine, data.latitude, data.longitude, data.isDefault ? 1 : 0],
    );

    res.status(201).json({ success: true, message: 'Address added', data: { id } });
  } catch (err) {
    next(err);
  }
});

export default router;
