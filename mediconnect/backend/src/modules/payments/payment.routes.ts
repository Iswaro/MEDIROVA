import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as controller from './payment.controller';

const router = Router();

// Public webhook endpoint (called by M-Pesa / payment gateway)
router.post('/webhook', controller.webhookController);

// Authenticated endpoints
router.post('/initiate', authenticate, controller.initiatePaymentController);
router.get('/:id', authenticate, controller.getPaymentController);
router.post('/:id/refund', authenticate, controller.refundController);

export default router;
