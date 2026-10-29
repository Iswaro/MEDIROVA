import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/errorHandler';
import { query, execute } from '../../db/pool';

const router = Router();

// ─── Schemas ──────────────────────────────────────────────────────────────────

const providerProfileSchema = z.object({
  bio: z.string().max(2000).optional(),
  providerType: z.enum([
    'DOCTOR',
    'NURSE',
    'LABORATORY',
    'PHARMACY',
    'AMBULANCE',
    'PHYSIOTHERAPIST',
    'HOME_CARE',
    'OTHER',
  ]).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  businessName: z.string().max(300).optional(),
  isAvailable: z.boolean().optional(),
});

const credentialsSchema = z.object({
  credentialType: z.string().min(1).max(100),
  credentialNumber: z.string().min(1).max(200),
  issuingAuthority: z.string().min(1).max(300),
  issueDate: z.string(),
  expiryDate: z.string().optional(),
  documentUrl: z.string().min(1),
});

const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6), // 0=Sunday
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
  isActive: z.boolean().default(true),
});

const providerServiceSchema = z.object({
  categoryId: z.string().uuid(),
  basePrice: z.number().positive(),
  priceUnit: z.enum(['PER_VISIT', 'PER_HOUR', 'FIXED']).default('PER_VISIT'),
  description: z.string().optional(),
});

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const searchSchema = z.object({
  lat: z.string().optional().transform(v => (v ? parseFloat(v) : undefined)),
  lng: z.string().optional().transform(v => (v ? parseFloat(v) : undefined)),
  radius: z.string().default('25').transform(Number), // km
  categoryId: z.string().optional(),
  providerType: z.string().optional(),
  page: z.string().default('1').transform(Number),
  limit: z.string().default('20').transform(Number),
});

// ─── Public Routes ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/providers
 * Search providers with optional Haversine distance if lat/lng provided.
 */
router.get('/', validate(searchSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radius, categoryId, providerType, page, limit } = req.query as unknown as z.infer<
      typeof searchSchema
    >;
    const offset = (page - 1) * limit;

    let sql: string;
    let params: unknown[];

    if (lat !== undefined && lng !== undefined) {
      sql = `
        SELECT pp.id, pp.user_id, pp.first_name, pp.last_name, pp.business_name,
               pp.provider_type, pp.profile_photo_url, pp.bio, pp.average_rating,
               pp.total_reviews, pp.is_available, pp.current_latitude, pp.current_longitude,
               ps.base_price, ps.price_unit, sc.name AS service_name, sc.id AS service_category_id,
               ( 6371 * ACOS(
                   LEAST(1.0, GREATEST(-1.0,
                     COS(RADIANS(?)) * COS(RADIANS(pp.current_latitude)) *
                     COS(RADIANS(pp.current_longitude) - RADIANS(?)) +
                     SIN(RADIANS(?)) * SIN(RADIANS(pp.current_latitude))
                   ))
               )) AS distance_km
        FROM provider_profiles pp
        JOIN users u ON u.id = pp.user_id
        LEFT JOIN provider_services ps ON ps.provider_id = pp.id AND ps.is_active = TRUE
        LEFT JOIN service_categories sc ON sc.id = ps.category_id
        WHERE pp.verification_status = 'VERIFIED'
          AND u.is_active = TRUE
          AND pp.current_latitude IS NOT NULL
          ${categoryId ? 'AND ps.category_id = ?' : ''}
          ${providerType ? 'AND pp.provider_type = ?' : ''}
        HAVING distance_km <= ?
        ORDER BY distance_km ASC, pp.average_rating DESC
        LIMIT ? OFFSET ?
      `;

      const filterParams: unknown[] = [lat, lng, lat];
      if (categoryId) filterParams.push(categoryId);
      if (providerType) filterParams.push(providerType);
      filterParams.push(radius, limit, offset);
      params = filterParams;
    } else {
      sql = `
        SELECT pp.id, pp.user_id, pp.first_name, pp.last_name, pp.business_name,
               pp.provider_type, pp.profile_photo_url, pp.bio, pp.average_rating,
               pp.total_reviews, pp.is_available, pp.current_latitude, pp.current_longitude,
               ps.base_price, ps.price_unit, sc.name AS service_name, sc.id AS service_category_id,
               NULL AS distance_km
        FROM provider_profiles pp
        JOIN users u ON u.id = pp.user_id
        LEFT JOIN provider_services ps ON ps.provider_id = pp.id AND ps.is_active = TRUE
        LEFT JOIN service_categories sc ON sc.id = ps.category_id
        WHERE pp.verification_status = 'VERIFIED'
          AND u.is_active = TRUE
          ${categoryId ? 'AND ps.category_id = ?' : ''}
          ${providerType ? 'AND pp.provider_type = ?' : ''}
        ORDER BY pp.average_rating DESC
        LIMIT ? OFFSET ?
      `;

      const filterParams: unknown[] = [];
      if (categoryId) filterParams.push(categoryId);
      if (providerType) filterParams.push(providerType);
      filterParams.push(limit, offset);
      params = filterParams;
    }

    const providers = await query<RowDataPacket>(sql, params);
    res.json({ success: true, data: providers, meta: { page, limit } });
  } catch (err) {
    next(err);
  }
});

/** GET /api/v1/providers/:id */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [provider] = await query<RowDataPacket>(
      `SELECT pp.*, u.email, u.phone
       FROM provider_profiles pp
       JOIN users u ON u.id = pp.user_id
       WHERE (pp.id = ? OR pp.user_id = ?) AND pp.verification_status = 'VERIFIED'`,
      [req.params.id, req.params.id],
    );
    if (!provider) throw new AppError('Provider not found', 404);

    // Get services offered
    const services = await query<RowDataPacket>(
      `SELECT ps.*, sc.name AS category_name, sc.icon_name
       FROM provider_services ps
       JOIN service_categories sc ON sc.id = ps.category_id
       WHERE ps.provider_id = ? AND ps.is_active = TRUE`,
      [provider.id],
    );

    // Get availability schedule
    const availability = await query<RowDataPacket>(
      `SELECT * FROM provider_availability WHERE provider_id = ? AND is_active = TRUE ORDER BY day_of_week, start_time`,
      [provider.id],
    );

    // Get reviews
    const reviews = await query<RowDataPacket>(
      `SELECT r.*, pat.first_name, pat.last_name
       FROM reviews r
       JOIN users u ON u.id = r.patient_user_id
       LEFT JOIN patient_profiles pat ON pat.user_id = u.id
       WHERE r.provider_id = ? AND r.is_visible = TRUE
       ORDER BY r.created_at DESC LIMIT 10`,
      [provider.id],
    );

    res.json({
      success: true,
      data: {
        ...provider,
        services,
        availability,
        reviews,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Protected Provider Routes ────────────────────────────────────────────────

const providerAuth = [authenticate, authorize(['PROVIDER'])];

/** GET /api/v1/providers/me/profile */
router.get('/me/profile', ...providerAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [profile] = await query<RowDataPacket>(
      `SELECT pp.*, u.email, u.phone
       FROM provider_profiles pp
       JOIN users u ON u.id = pp.user_id
       WHERE pp.user_id = ?`,
      [req.user!.id],
    );
    if (!profile) throw new AppError('Provider profile not found', 404);

    const services = await query<RowDataPacket>(
      `SELECT ps.*, sc.name AS category_name
       FROM provider_services ps
       JOIN service_categories sc ON sc.id = ps.category_id
       WHERE ps.provider_id = ?`,
      [profile.id],
    );

    const credentials = await query<RowDataPacket>(
      'SELECT id, credential_type, credential_number, issuing_authority, issue_date, expiry_date, verified_at, created_at FROM provider_credentials WHERE provider_id = ?',
      [profile.id],
    );

    const availability = await query<RowDataPacket>(
      'SELECT * FROM provider_availability WHERE provider_id = ? ORDER BY day_of_week, start_time',
      [profile.id],
    );

    res.json({
      success: true,
      data: {
        ...profile,
        services,
        credentials,
        availability,
      },
    });
  } catch (err) {
    next(err);
  }
});

/** PATCH /api/v1/providers/profile */
router.patch(
  '/profile',
  ...providerAuth,
  validate(providerProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as z.infer<typeof providerProfileSchema>;
      await execute(
        `UPDATE provider_profiles
         SET bio = COALESCE(?, bio),
             first_name = COALESCE(?, first_name),
             last_name = COALESCE(?, last_name),
             business_name = COALESCE(?, business_name),
             provider_type = COALESCE(?, provider_type),
             is_available = COALESCE(?, is_available),
             updated_at = UTC_TIMESTAMP()
         WHERE user_id = ?`,
        [
          data.bio ?? null,
          data.firstName ?? null,
          data.lastName ?? null,
          data.businessName ?? null,
          data.providerType ?? null,
          data.isAvailable !== undefined ? (data.isAvailable ? 1 : 0) : null,
          req.user!.id,
        ],
      );
      res.json({ success: true, message: 'Provider profile updated' });
    } catch (err) {
      next(err);
    }
  },
);

/** POST /api/v1/providers/credentials */
router.post(
  '/credentials',
  ...providerAuth,
  validate(credentialsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [pp] = await query<RowDataPacket>('SELECT id FROM provider_profiles WHERE user_id = ?', [
        req.user!.id,
      ]);
      if (!pp) throw new AppError('Provider profile not found', 404);

      const data = req.body as z.infer<typeof credentialsSchema>;
      const id = uuidv4();
      await execute(
        `INSERT INTO provider_credentials (
          id, provider_id, credential_type, credential_number, issuing_authority, issue_date, expiry_date, document_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          pp.id,
          data.credentialType,
          data.credentialNumber,
          data.issuingAuthority,
          new Date(data.issueDate),
          data.expiryDate ? new Date(data.expiryDate) : null,
          data.documentUrl,
        ],
      );
      res.status(201).json({ success: true, message: 'Credential submitted for review', data: { id } });
    } catch (err) {
      next(err);
    }
  },
);

/** POST /api/v1/providers/services */
router.post(
  '/services',
  ...providerAuth,
  validate(providerServiceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [pp] = await query<RowDataPacket>('SELECT id FROM provider_profiles WHERE user_id = ?', [
        req.user!.id,
      ]);
      if (!pp) throw new AppError('Provider profile not found', 404);

      const data = req.body as z.infer<typeof providerServiceSchema>;
      const id = uuidv4();
      await execute(
        `INSERT INTO provider_services (id, provider_id, category_id, base_price, price_unit, description)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE base_price = VALUES(base_price), price_unit = VALUES(price_unit), description = VALUES(description), is_active = TRUE`,
        [id, pp.id, data.categoryId, data.basePrice, data.priceUnit, data.description ?? null],
      );
      res.status(201).json({ success: true, message: 'Service added/updated', data: { id } });
    } catch (err) {
      next(err);
    }
  },
);

/** POST /api/v1/providers/availability */
router.post(
  '/availability',
  ...providerAuth,
  validate(availabilitySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [pp] = await query<RowDataPacket>('SELECT id FROM provider_profiles WHERE user_id = ?', [
        req.user!.id,
      ]);
      if (!pp) throw new AppError('Provider profile not found', 404);

      const data = req.body as z.infer<typeof availabilitySchema>;
      const id = uuidv4();
      await execute(
        `INSERT INTO provider_availability (id, provider_id, day_of_week, start_time, end_time, is_active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, pp.id, data.dayOfWeek, data.startTime, data.endTime, data.isActive ? 1 : 0],
      );
      res.status(201).json({ success: true, message: 'Availability slot added', data: { id } });
    } catch (err) {
      next(err);
    }
  },
);

/** GET /api/v1/providers/me/earnings */
router.get('/me/earnings', ...providerAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [pp] = await query<RowDataPacket>('SELECT id FROM provider_profiles WHERE user_id = ?', [
      req.user!.id,
    ]);
    if (!pp) throw new AppError('Provider profile not found', 404);

    const [earnings] = await query<RowDataPacket>(
      `SELECT
         COUNT(CASE WHEN b.status = 'COMPLETED' THEN 1 END) AS total_completed,
         COALESCE(SUM(CASE WHEN b.status = 'COMPLETED' THEN b.provider_payout ELSE 0 END), 0) AS total_earnings,
         COALESCE(SUM(CASE WHEN b.status = 'COMPLETED' AND DATE(b.completed_at) = CURDATE() THEN b.provider_payout ELSE 0 END), 0) AS today_earnings,
         COALESCE(SUM(CASE WHEN b.status = 'COMPLETED' AND YEARWEEK(b.completed_at) = YEARWEEK(UTC_TIMESTAMP()) THEN b.provider_payout ELSE 0 END), 0) AS week_earnings
       FROM bookings b
       WHERE b.provider_id = ?`,
      [pp.id],
    );

    const history = await query<RowDataPacket>(
      `SELECT b.id, b.completed_at, b.final_price, b.provider_payout, b.platform_commission,
              sc.name AS service_name, pat.first_name, pat.last_name
       FROM bookings b
       JOIN service_categories sc ON sc.id = b.category_id
       LEFT JOIN patient_profiles pat ON pat.user_id = b.patient_user_id
       WHERE b.provider_id = ? AND b.status = 'COMPLETED'
       ORDER BY b.completed_at DESC LIMIT 20`,
      [pp.id],
    );

    res.json({ success: true, data: { summary: earnings, history } });
  } catch (err) {
    next(err);
  }
});

/** PATCH /api/v1/providers/location */
router.patch(
  '/location',
  ...providerAuth,
  validate(locationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [pp] = await query<RowDataPacket>('SELECT id FROM provider_profiles WHERE user_id = ?', [
        req.user!.id,
      ]);
      if (!pp) throw new AppError('Provider profile not found', 404);

      const { latitude, longitude } = req.body as z.infer<typeof locationSchema>;
      await execute(
        'UPDATE provider_profiles SET current_latitude = ?, current_longitude = ?, updated_at = UTC_TIMESTAMP() WHERE id = ?',
        [latitude, longitude, pp.id],
      );

      // Also upsert in provider_locations real-time ping table
      await execute(
        `INSERT INTO provider_locations (id, provider_id, latitude, longitude)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE latitude = VALUES(latitude), longitude = VALUES(longitude), updated_at = UTC_TIMESTAMP()`,
        [uuidv4(), pp.id, latitude, longitude],
      );

      res.json({ success: true, message: 'Location updated' });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
