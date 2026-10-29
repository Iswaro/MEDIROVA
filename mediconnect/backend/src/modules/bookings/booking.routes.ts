import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as controller from './booking.controller';

const router = Router();

router.use(authenticate);

// List bookings for current user (patient/provider)
router.get('/', controller.getBookingsController);

// Get single booking by ID
router.get('/:id', controller.getBookingByIdController);

// Patient creates a booking
router.post('/', authorize(['PATIENT']), controller.createBookingController);

// Provider actions - accept POST & PATCH
router.post('/:id/accept', authorize(['PROVIDER']), controller.acceptBookingController);
router.patch('/:id/accept', authorize(['PROVIDER']), controller.acceptBookingController);

router.post('/:id/reject', authorize(['PROVIDER']), controller.rejectBookingController);
router.patch('/:id/reject', authorize(['PROVIDER']), controller.rejectBookingController);

router.post('/:id/status', authorize(['PROVIDER']), controller.updateBookingStatusController);
router.patch('/:id/status', authorize(['PROVIDER']), controller.updateBookingStatusController);

router.post('/:id/complete', authorize(['PROVIDER']), controller.completeBookingController);
router.patch('/:id/complete', authorize(['PROVIDER']), controller.completeBookingController);

// Cancel booking (Patient or Provider or Admin)
router.post('/:id/cancel', authorize(['PATIENT', 'PROVIDER', 'ADMIN']), controller.cancelBookingController);
router.patch('/:id/cancel', authorize(['PATIENT', 'PROVIDER', 'ADMIN']), controller.cancelBookingController);

export default router;
