import { Router, Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import { query } from '../../db/pool';

const router = Router();

/**
 * GET /api/v1/categories
 * Returns active medical service categories
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await query<RowDataPacket>(
      'SELECT id, slug, name, description, icon_name, display_order FROM service_categories WHERE is_active = TRUE ORDER BY display_order ASC',
    );
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

export default router;
