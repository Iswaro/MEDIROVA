import { Request, Response, NextFunction } from 'express';
import * as bookingService from './booking.service';
import { BookingStatus } from './booking.statemachine';
import { AppError } from '../../middleware/errorHandler';

export async function createBookingController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const booking = await bookingService.createBooking(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Booking requested', data: booking });
  } catch (err) {
    next(err);
  }
}

export async function getBookingsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;

    const result = await bookingService.getBookings(req.user.id, req.user.role, status, page, limit);
    res.json({
      success: true,
      data: result.bookings,
      meta: { total: result.total, page, limit },
    });
  } catch (err) {
    next(err);
  }
}

export async function getBookingByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const booking = await bookingService.getBookingById(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

export async function acceptBookingController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    await bookingService.acceptBooking(req.params.id, req.user.id);
    res.json({ success: true, message: 'Booking accepted' });
  } catch (err) {
    next(err);
  }
}

export async function rejectBookingController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { reason } = req.body;
    await bookingService.rejectBooking(req.params.id, req.user.id, reason);
    res.json({ success: true, message: 'Booking rejected' });
  } catch (err) {
    next(err);
  }
}

export async function cancelBookingController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { reason } = req.body;
    await bookingService.cancelBooking(req.params.id, req.user.id, req.user.role as 'PATIENT' | 'PROVIDER', reason);
    res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) {
    next(err);
  }
}

export async function updateBookingStatusController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { status, note } = req.body;
    await bookingService.updateBookingStatus(req.params.id, req.user.id, status as BookingStatus, note);
    res.json({ success: true, message: `Booking status updated to ${status}` });
  } catch (err) {
    next(err);
  }
}

export async function completeBookingController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    await bookingService.completeBooking(req.params.id, req.user.id);
    res.json({ success: true, message: 'Booking marked as completed' });
  } catch (err) {
    next(err);
  }
}
