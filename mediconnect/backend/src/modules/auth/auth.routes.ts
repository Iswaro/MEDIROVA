import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { auditLog } from '../../middleware/auditLog';
import { registerSchema, loginSchema } from './auth.schemas';
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  meController,
} from './auth.controller';

const router = Router();

/** POST /api/v1/auth/register */
router.post(
  '/register',
  validate(registerSchema),
  auditLog({ action: 'AUTH_REGISTER' }),
  registerController,
);

/** POST /api/v1/auth/login */
router.post(
  '/login',
  validate(loginSchema),
  auditLog({ action: 'AUTH_LOGIN' }),
  loginController,
);

/** POST /api/v1/auth/logout */
router.post('/logout', logoutController);

/** POST /api/v1/auth/refresh */
router.post('/refresh', refreshController);

/** GET /api/v1/auth/me */
router.get('/me', authenticate, meController);

export default router;
