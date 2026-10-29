import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';
import { query, execute, getConnection } from '../../db/pool';
import { AppError } from '../../middleware/errorHandler';
import { logAuditEvent } from '../../middleware/auditLog';
import { assertValidTransition, BookingStatus } from './booking.statemachine';
import { getIO } from '../../sockets';

export interface BookingRow extends RowDataPacket {
  id: string;
  patient_user_id: string;
  provider_id: string | null;
  category_id: string;
  booking_type: 'IMMEDIATE' | 'SCHEDULED';
  status: BookingStatus;
  patient_address_id: string | null;
  patient_latitude: number;
  patient_longitude: number;
  patient_address_text: string;
  scheduled_at: Date | null;
  notes: string | null;
  quoted_price: number | null;
  final_price: number | null;
  platform_commission: number | null;
  provider_payout: number | null;
  accepted_at: Date | null;
  completed_at: Date | null;
  cancelled_at: Date | null;
  cancellation_reason: string | null;
  created_at: Date;
  updated_at: Date;
  // joined fields
  category_name?: string;
  patient_first_name?: string;
  patient_last_name?: string;
  patient_phone?: string;
  provider_first_name?: string;
  provider_last_name?: string;
  provider_type?: string;
  provider_phone?: string;
}

export interface CreateBookingInput {
  categoryId: string;
  providerId?: string;
  bookingType?: 'IMMEDIATE' | 'SCHEDULED';
  latitude: number;
  longitude: number;
  addressText: string;
  addressId?: string;
  scheduledAt?: string;
  notes?: string;
  quotedPrice?: number;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createBooking(patientUserId: string, data: CreateBookingInput): Promise<BookingRow> {
  let providerProfileId: string | null = null;

  if (data.providerId) {
    // Check if providerId is a provider_profiles.id or user_id
    const [p] = await query<RowDataPacket>(
      `SELECT id FROM provider_profiles 
       WHERE (id = ? OR user_id = ?) AND verification_status = 'VERIFIED'`,
      [data.providerId, data.providerId],
    );
    if (!p) throw new AppError('Provider not found or not verified', 404);
    providerProfileId = p.id;
  }

  // Calculate prices
  const quotedPrice = data.quotedPrice ?? 2500.0;
  const platformCommission = Number((quotedPrice * 0.15).toFixed(2));
  const providerPayout = Number((quotedPrice - platformCommission).toFixed(2));

  const id = uuidv4();
  await execute(
    `INSERT INTO bookings (
      id, patient_user_id, provider_id, category_id, booking_type, status,
      patient_address_id, patient_latitude, patient_longitude, patient_address_text,
      scheduled_at, notes, quoted_price, platform_commission, provider_payout
    ) VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      patientUserId,
      providerProfileId,
      data.categoryId,
      data.bookingType ?? 'IMMEDIATE',
      data.addressId ?? null,
      data.latitude,
      data.longitude,
      data.addressText,
      data.scheduledAt ? new Date(data.scheduledAt) : null,
      data.notes ?? null,
      quotedPrice,
      platformCommission,
      providerPayout,
    ],
  );

  await insertStatusHistory(id, null, 'PENDING', patientUserId, 'Booking created');

  // Emit to provider socket room if specific provider targeted
  try {
    const io = getIO();
    if (providerProfileId) {
      // Find provider user_id
      const [prov] = await query<RowDataPacket>('SELECT user_id FROM provider_profiles WHERE id = ?', [providerProfileId]);
      if (prov) {
        io.to(`provider:${prov.user_id}`).emit('booking:new', {
          bookingId: id,
          patientUserId,
          categoryId: data.categoryId,
          quotedPrice,
          addressText: data.addressText,
        });
      }
    } else {
      // Broadcast to all available providers in service category
      io.emit('booking:broadcast', {
        bookingId: id,
        categoryId: data.categoryId,
        latitude: data.latitude,
        longitude: data.longitude,
      });
    }
  } catch {
    /* socket not active in standalone test */
  }

  return getBookingById(id, patientUserId, 'PATIENT');
}

// ─── Accept (with Transaction & Row Lock) ──────────────────────────────────────

export async function acceptBooking(bookingId: string, providerUserId: string): Promise<void> {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    // Get provider profile id
    const [pRows] = await conn.execute<RowDataPacket[]>(
      "SELECT id FROM provider_profiles WHERE user_id = ? AND verification_status = 'VERIFIED'",
      [providerUserId],
    );
    const providerProfile = pRows[0];
    if (!providerProfile) throw new AppError('Verified provider profile not found', 403);

    const [bRows] = await conn.execute<BookingRow[]>(
      'SELECT * FROM bookings WHERE id = ? FOR UPDATE',
      [bookingId],
    );
    const booking = bRows[0];
    if (!booking) throw new AppError('Booking not found', 404);

    if (booking.status !== 'PENDING') {
      throw new AppError(`Booking is no longer pending (current: ${booking.status})`, 409);
    }

    assertValidTransition(booking.status, 'ACCEPTED');

    await conn.execute(
      `UPDATE bookings 
       SET status = 'ACCEPTED', provider_id = ?, accepted_at = UTC_TIMESTAMP(), updated_at = UTC_TIMESTAMP() 
       WHERE id = ?`,
      [providerProfile.id, bookingId],
    );

    await conn.execute(
      `INSERT INTO booking_status_history (id, booking_id, from_status, to_status, changed_by_user_id, notes)
       VALUES (?, ?, 'PENDING', 'ACCEPTED', ?, 'Provider accepted booking')`,
      [uuidv4(), bookingId, providerUserId],
    );

    await conn.commit();

    emitBookingEvent('booking:accepted', bookingId, booking.patient_user_id, {
      providerId: providerProfile.id,
      status: 'ACCEPTED',
    });
    await logAuditEvent(providerUserId, 'BOOKING_ACCEPTED', 'bookings', bookingId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ─── Reject ───────────────────────────────────────────────────────────────────

export async function rejectBooking(bookingId: string, providerUserId: string, reason?: string): Promise<void> {
  const [booking] = await query<BookingRow>('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  if (!booking) throw new AppError('Booking not found', 404);

  assertValidTransition(booking.status, 'REJECTED');

  await execute(
    "UPDATE bookings SET status = 'REJECTED', cancellation_reason = ?, updated_at = UTC_TIMESTAMP() WHERE id = ?",
    [reason ?? 'Provider unavailable', bookingId],
  );

  await insertStatusHistory(bookingId, booking.status, 'REJECTED', providerUserId, reason ?? 'Rejected');
  emitBookingEvent('booking:rejected', bookingId, booking.patient_user_id, { status: 'REJECTED' });
  await logAuditEvent(providerUserId, 'BOOKING_REJECTED', 'bookings', bookingId);
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

export async function cancelBooking(
  bookingId: string,
  userId: string,
  role: 'PATIENT' | 'PROVIDER' | 'ADMIN',
  reason?: string,
): Promise<void> {
  const [booking] = await query<BookingRow>('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  if (!booking) throw new AppError('Booking not found', 404);

  const nextStatus: BookingStatus =
    role === 'PATIENT' ? 'CANCELLED_BY_PATIENT' : 'CANCELLED_BY_PROVIDER';

  assertValidTransition(booking.status, nextStatus);

  await execute(
    `UPDATE bookings 
     SET status = ?, cancelled_at = UTC_TIMESTAMP(), cancellation_reason = ?, updated_at = UTC_TIMESTAMP() 
     WHERE id = ?`,
    [nextStatus, reason ?? 'Cancelled', bookingId],
  );

  await insertStatusHistory(bookingId, booking.status, nextStatus, userId, reason ?? 'Cancelled');

  const notifyUser = role === 'PATIENT' ? booking.provider_id : booking.patient_user_id;
  if (notifyUser) {
    emitBookingEvent('booking:cancelled', bookingId, notifyUser, { status: nextStatus, reason });
  }

  await logAuditEvent(userId, 'BOOKING_CANCELLED', 'bookings', bookingId, { by: role, reason });
}

// ─── Status Update (EN_ROUTE, ARRIVED, IN_PROGRESS) ───────────────────────────

export async function updateBookingStatus(
  bookingId: string,
  providerUserId: string,
  nextStatus: BookingStatus,
  note?: string,
): Promise<void> {
  const [booking] = await query<BookingRow>('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  if (!booking) throw new AppError('Booking not found', 404);

  assertValidTransition(booking.status, nextStatus);

  await execute(
    'UPDATE bookings SET status = ?, updated_at = UTC_TIMESTAMP() WHERE id = ?',
    [nextStatus, bookingId],
  );

  await insertStatusHistory(bookingId, booking.status, nextStatus, providerUserId, note ?? null);
  emitBookingEvent('booking:status_updated', bookingId, booking.patient_user_id, { status: nextStatus });
  await logAuditEvent(providerUserId, 'BOOKING_STATUS_UPDATE', 'bookings', bookingId, { status: nextStatus });
}

// ─── Complete ─────────────────────────────────────────────────────────────────

export async function completeBooking(bookingId: string, providerUserId: string): Promise<void> {
  const [booking] = await query<BookingRow>('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  if (!booking) throw new AppError('Booking not found', 404);

  assertValidTransition(booking.status, 'COMPLETED');

  await execute(
    `UPDATE bookings 
     SET status = 'COMPLETED', final_price = quoted_price, completed_at = UTC_TIMESTAMP(), updated_at = UTC_TIMESTAMP() 
     WHERE id = ?`,
    [bookingId],
  );

  await insertStatusHistory(bookingId, booking.status, 'COMPLETED', providerUserId, 'Service completed');
  emitBookingEvent('booking:completed', bookingId, booking.patient_user_id, { status: 'COMPLETED' });
  await logAuditEvent(providerUserId, 'BOOKING_COMPLETED', 'bookings', bookingId);
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getBookings(
  userId: string,
  role: string,
  status?: string,
  page = 1,
  limit = 10,
): Promise<{ bookings: BookingRow[]; total: number }> {
  const offset = (page - 1) * limit;
  let whereClause = '';
  const params: unknown[] = [];

  if (role === 'PATIENT') {
    whereClause = 'WHERE b.patient_user_id = ?';
    params.push(userId);
  } else if (role === 'PROVIDER') {
    whereClause = 'WHERE pp.user_id = ?';
    params.push(userId);
  } else {
    whereClause = 'WHERE 1=1';
  }

  if (status) {
    whereClause += ' AND b.status = ?';
    params.push(status);
  }

  const [countResult] = await query<RowDataPacket>(
    `SELECT COUNT(*) AS total 
     FROM bookings b 
     LEFT JOIN provider_profiles pp ON pp.id = b.provider_id 
     ${whereClause}`,
    params,
  );
  const total = Number(countResult?.total ?? 0);

  const bookings = await query<BookingRow>(
    `SELECT b.*,
            sc.name AS category_name,
            pat_p.first_name AS patient_first_name,
            pat_p.last_name AS patient_last_name,
            u_pat.phone AS patient_phone,
            prov_p.first_name AS provider_first_name,
            prov_p.last_name AS provider_last_name,
            prov_p.provider_type,
            u_prov.phone AS provider_phone
     FROM bookings b
     JOIN service_categories sc ON sc.id = b.category_id
     JOIN users u_pat ON u_pat.id = b.patient_user_id
     LEFT JOIN patient_profiles pat_p ON pat_p.user_id = u_pat.id
     LEFT JOIN provider_profiles prov_p ON prov_p.id = b.provider_id
     LEFT JOIN users u_prov ON u_prov.id = prov_p.user_id
     LEFT JOIN provider_profiles pp ON pp.id = b.provider_id
     ${whereClause}
     ORDER BY b.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return { bookings, total };
}

export async function getBookingById(bookingId: string, userId: string, role = 'PATIENT'): Promise<BookingRow> {
  const [booking] = await query<BookingRow>(
    `SELECT b.*,
            sc.name AS category_name,
            pat_p.first_name AS patient_first_name,
            pat_p.last_name AS patient_last_name,
            u_pat.phone AS patient_phone,
            prov_p.first_name AS provider_first_name,
            prov_p.last_name AS provider_last_name,
            prov_p.provider_type,
            u_prov.phone AS provider_phone
     FROM bookings b
     JOIN service_categories sc ON sc.id = b.category_id
     JOIN users u_pat ON u_pat.id = b.patient_user_id
     LEFT JOIN patient_profiles pat_p ON pat_p.user_id = u_pat.id
     LEFT JOIN provider_profiles prov_p ON prov_p.id = b.provider_id
     LEFT JOIN users u_prov ON u_prov.id = prov_p.user_id
     WHERE b.id = ?`,
    [bookingId],
  );

  if (!booking) throw new AppError('Booking not found', 404);

  // Authorization check
  if (role === 'PATIENT' && booking.patient_user_id !== userId) {
    throw new AppError('Forbidden', 403);
  }

  // Get status history
  const history = await query<RowDataPacket>(
    `SELECT bsh.*, u.email AS changed_by_email 
     FROM booking_status_history bsh
     JOIN users u ON u.id = bsh.changed_by_user_id
     WHERE bsh.booking_id = ?
     ORDER BY bsh.created_at ASC`,
    [bookingId],
  );

  return { ...booking, status_history: history } as BookingRow;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function insertStatusHistory(
  bookingId: string,
  fromStatus: string | null,
  toStatus: string,
  userId: string,
  notes?: string | null,
): Promise<void> {
  await execute(
    `INSERT INTO booking_status_history (id, booking_id, from_status, to_status, changed_by_user_id, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [uuidv4(), bookingId, fromStatus, toStatus, userId, notes ?? null],
  );
}

function emitBookingEvent(
  event: string,
  bookingId: string,
  recipientUserId: string,
  payload: Record<string, unknown>,
): void {
  try {
    const io = getIO();
    io.to(`booking:${bookingId}`).emit(event, { bookingId, ...payload });
    io.to(`patient:${recipientUserId}`).emit(event, { bookingId, ...payload });
  } catch {
    /* socket not active */
  }
}
