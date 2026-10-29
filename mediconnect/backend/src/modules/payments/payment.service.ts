import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';
import { query, execute } from '../../db/pool';
import { config } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { logAuditEvent } from '../../middleware/auditLog';
import { IPaymentAdapter, PaymentMethod } from './payment.interface';
import { MockPaymentAdapter } from './mock.adapter';
import { MpesaDarajaAdapter } from './mpesa.adapter';
import { getIO } from '../../sockets';

export function getPaymentAdapter(method?: PaymentMethod): IPaymentAdapter {
  if (method === 'MPESA' || config.PAYMENT_PROVIDER === 'mpesa') {
    return new MpesaDarajaAdapter();
  }
  return new MockPaymentAdapter();
}

export interface InitiatePaymentDTO {
  bookingId: string;
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
  idempotencyKey?: string;
}

export async function initiatePayment(patientUserId: string, dto: InitiatePaymentDTO) {
  // Check booking
  const [booking] = await query<RowDataPacket>(
    'SELECT * FROM bookings WHERE id = ? AND patient_user_id = ?',
    [dto.bookingId, patientUserId],
  );
  if (!booking) throw new AppError('Booking not found', 404);

  // Check if already paid
  const [existingPayment] = await query<RowDataPacket>(
    'SELECT * FROM payments WHERE booking_id = ?',
    [dto.bookingId],
  );

  if (existingPayment && existingPayment.status === 'COMPLETED') {
    throw new AppError('Booking has already been paid for', 400);
  }

  const idempotencyKey = dto.idempotencyKey || uuidv4();
  const paymentId = existingPayment ? existingPayment.id : uuidv4();
  const amount = Number(booking.final_price || booking.quoted_price || 2500);

  const adapter = getPaymentAdapter(dto.paymentMethod);
  const result = await adapter.initiate({
    bookingId: dto.bookingId,
    patientUserId,
    amount,
    currency: 'KES',
    phoneNumber: dto.phoneNumber,
    idempotencyKey,
  });

  if (existingPayment) {
    await execute(
      `UPDATE payments 
       SET payment_method = ?, amount = ?, status = ?, gateway_reference = ?, gateway_response = ?,
           paid_at = ?, updated_at = UTC_TIMESTAMP()
       WHERE id = ?`,
      [
        dto.paymentMethod,
        amount,
        result.status,
        result.gatewayReference,
        result.data ? JSON.stringify(result.data) : null,
        result.status === 'COMPLETED' ? new Date() : null,
        paymentId,
      ],
    );
  } else {
    await execute(
      `INSERT INTO payments (
        id, booking_id, patient_user_id, amount, currency, payment_method, status,
        gateway_reference, gateway_response, idempotency_key, paid_at
      ) VALUES (?, ?, ?, ?, 'KES', ?, ?, ?, ?, ?, ?)`,
      [
        paymentId,
        dto.bookingId,
        patientUserId,
        amount,
        dto.paymentMethod,
        result.status,
        result.gatewayReference,
        result.data ? JSON.stringify(result.data) : null,
        idempotencyKey,
        result.status === 'COMPLETED' ? new Date() : null,
      ],
    );
  }

  if (result.status === 'COMPLETED') {
    try {
      const io = getIO();
      io.to(`booking:${dto.bookingId}`).emit('payment:completed', {
        paymentId,
        bookingId: dto.bookingId,
        amount,
        status: 'COMPLETED',
      });
    } catch {
      /* socket offline */
    }
  }

  await logAuditEvent(patientUserId, 'PAYMENT_INITIATED', 'payments', paymentId, {
    method: dto.paymentMethod,
    amount,
    status: result.status,
  });

  return {
    paymentId,
    status: result.status,
    amount,
    currency: 'KES',
    gatewayReference: result.gatewayReference,
    instruction: result.instruction,
  };
}

export async function handleWebhook(headers: Record<string, unknown>, body: Record<string, unknown>) {
  const adapter = getPaymentAdapter('MPESA');
  const result = await adapter.verifyWebhook(headers, body);

  const [payment] = await query<RowDataPacket>(
    'SELECT * FROM payments WHERE gateway_reference = ?',
    [result.gatewayReference],
  );

  if (!payment) {
    throw new AppError('Transaction not found for reference', 404);
  }

  if (payment.status === 'COMPLETED') {
    // Idempotent: return success without duplicate processing
    return { success: true, message: 'Already processed' };
  }

  await execute(
    `UPDATE payments
     SET status = ?, gateway_response = ?, paid_at = ?, updated_at = UTC_TIMESTAMP()
     WHERE id = ?`,
    [
      result.status,
      JSON.stringify(result.rawPayload),
      result.status === 'COMPLETED' ? new Date() : null,
      payment.id,
    ],
  );

  if (result.status === 'COMPLETED') {
    try {
      const io = getIO();
      io.to(`booking:${payment.booking_id}`).emit('payment:completed', {
        paymentId: payment.id,
        bookingId: payment.booking_id,
        amount: payment.amount,
        status: 'COMPLETED',
      });
    } catch {
      /* socket offline */
    }
  }

  await logAuditEvent(payment.patient_user_id, 'PAYMENT_WEBHOOK_PROCESSED', 'payments', payment.id, {
    status: result.status,
  });

  return { success: true };
}

export async function getPaymentByBookingId(bookingId: string, userId: string, role = 'PATIENT') {
  const [payment] = await query<RowDataPacket>(
    'SELECT * FROM payments WHERE booking_id = ?',
    [bookingId],
  );

  if (!payment) throw new AppError('Payment not found', 404);

  if (role === 'PATIENT' && payment.patient_user_id !== userId) {
    throw new AppError('Forbidden', 403);
  }

  return payment;
}

export async function requestRefund(
  paymentId: string,
  userId: string,
  reason: string,
  amount?: number,
) {
  const [payment] = await query<RowDataPacket>('SELECT * FROM payments WHERE id = ?', [paymentId]);
  if (!payment) throw new AppError('Payment not found', 404);
  if (payment.status !== 'COMPLETED') throw new AppError('Only completed payments can be refunded', 400);

  const refundAmount = amount || payment.amount;
  const refundId = uuidv4();

  await execute(
    `INSERT INTO refunds (id, payment_id, requested_by_user_id, amount, reason, status)
     VALUES (?, ?, ?, ?, ?, 'PENDING')`,
    [refundId, paymentId, userId, refundAmount, reason],
  );

  await logAuditEvent(userId, 'REFUND_REQUESTED', 'refunds', refundId, { amount: refundAmount, reason });

  return { refundId, status: 'PENDING' };
}
