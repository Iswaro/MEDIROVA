import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/errorHandler';
import * as reviewService from './review.service';

const router = Router();

const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// Patient submits review
router.post(
  '/',
  authenticate,
  authorize(['PATIENT']),
  validate(createReviewSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const review = await reviewService.createReview(req.user.id, req.body);
      res.status(201).json({ success: true, message: 'Review submitted', data: review });
    } catch (err) {
      next(err);
    }
  },
);

// Public: get reviews for provider
router.get('/providers/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await reviewService.getProviderReviews(req.params.id, page, limit);
    res.json({ success: true, data: result.reviews, meta: { total: result.total, page, limit } });
  } catch (err) {
    next(err);
  }
});

export default router;
