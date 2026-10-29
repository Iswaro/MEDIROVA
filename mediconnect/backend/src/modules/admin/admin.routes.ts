import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as controller from './admin.controller';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize(['ADMIN']));

router.get('/dashboard', controller.getDashboardController);
router.get('/users', controller.getUsersController);
router.patch('/users/:id/status', controller.toggleUserStatusController);
router.get('/providers/pending', controller.getPendingProvidersController);
router.patch('/providers/:id/verification', controller.verifyProviderController);
router.get('/audit-logs', controller.getAuditLogsController);
router.get('/settings', controller.getSettingsController);
router.patch('/settings', controller.updateSettingController);

export default router;
