import { Request, Response, NextFunction } from 'express';
import * as paymentService from './payment.service';
import { AppError } from '../../middleware/errorHandler';

export async function initiatePaymentController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const result = await paymentService.initiatePayment(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Payment initiated', data: result });
  } catch (err) {
    next(err);
  }
}

export async function webhookController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await paymentService.handleWebhook(req.headers, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPaymentController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const payment = await paymentService.getPaymentByBookingId(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
}

export async function refundController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { reason, amount } = req.body;
    const result = await paymentService.requestRefund(req.params.id, req.user.id, reason, amount);
    res.json({ success: true, message: 'Refund requested', data: result });
  } catch (err) {
    next(err);
  }
}
