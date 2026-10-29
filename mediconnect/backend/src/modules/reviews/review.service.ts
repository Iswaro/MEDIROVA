import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';
import { query, execute } from '../../db/pool';
import { AppError } from '../../middleware/errorHandler';
import { logAuditEvent } from '../../middleware/auditLog';

export interface CreateReviewDTO {
  bookingId: string;
  rating: number; // 1-5
  comment?: string;
}

export async function createReview(patientUserId: string, dto: CreateReviewDTO) {
  // Validate booking
  const [booking] = await query<RowDataPacket>(
    'SELECT * FROM bookings WHERE id = ? AND patient_user_id = ?',
    [dto.bookingId, patientUserId],
  );

  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.status !== 'COMPLETED') {
    throw new AppError('Reviews can only be submitted after booking completion', 400);
  }
  if (!booking.provider_id) {
    throw new AppError('No provider associated with this booking', 400);
  }

  // Check duplicate review
  const [existing] = await query<RowDataPacket>(
    'SELECT id FROM reviews WHERE booking_id = ?',
    [dto.bookingId],
  );
  if (existing) {
    throw new AppError('A review has already been submitted for this booking', 409);
  }

  const reviewId = uuidv4();
  await execute(
    `INSERT INTO reviews (id, booking_id, patient_user_id, provider_id, rating, comment)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [reviewId, dto.bookingId, patientUserId, booking.provider_id, dto.rating, dto.comment ?? null],
  );

  // Recalculate provider average rating and review count
  const [stats] = await query<RowDataPacket>(
    `SELECT AVG(rating) AS avg_rating, COUNT(*) AS count
     FROM reviews
     WHERE provider_id = ? AND is_visible = TRUE`,
    [booking.provider_id],
  );

  const avgRating = Number(stats?.avg_rating || 0).toFixed(2);
  const count = Number(stats?.count || 0);

  await execute(
    'UPDATE provider_profiles SET average_rating = ?, total_reviews = ?, updated_at = UTC_TIMESTAMP() WHERE id = ?',
    [avgRating, count, booking.provider_id],
  );

  await logAuditEvent(patientUserId, 'REVIEW_CREATED', 'reviews', reviewId, {
    rating: dto.rating,
    providerId: booking.provider_id,
  });

  return { id: reviewId, rating: dto.rating, comment: dto.comment };
}

export async function getProviderReviews(providerId: string, page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  // Supports either provider_profiles.id or user_id
  const reviews = await query<RowDataPacket>(
    `SELECT r.id, r.rating, r.comment, r.created_at,
            pat.first_name, pat.last_name
     FROM reviews r
     JOIN provider_profiles pp ON pp.id = r.provider_id
     JOIN users u ON u.id = r.patient_user_id
     LEFT JOIN patient_profiles pat ON pat.user_id = u.id
     WHERE (r.provider_id = ? OR pp.user_id = ?) AND r.is_visible = TRUE
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [providerId, providerId, limit, offset],
  );

  const [count] = await query<RowDataPacket>(
    `SELECT COUNT(*) AS total
     FROM reviews r
     JOIN provider_profiles pp ON pp.id = r.provider_id
     WHERE (r.provider_id = ? OR pp.user_id = ?) AND r.is_visible = TRUE`,
    [providerId, providerId],
  );

  return { reviews, total: Number(count?.total ?? 0), page, limit };
}
