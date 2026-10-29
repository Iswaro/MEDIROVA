import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';
import { AppError } from '../../middleware/errorHandler';

export async function getDashboardController(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await adminService.getDashboardMetrics();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getUsersController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await adminService.getUsers(role, search, page, limit);
    res.json({ success: true, data: result.users, meta: { total: result.total, page, limit } });
  } catch (err) {
    next(err);
  }
}

export async function toggleUserStatusController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { isActive } = req.body;
    await adminService.toggleUserStatus(req.params.id, isActive, req.user.id);
    res.json({ success: true, message: `User ${isActive ? 'activated' : 'suspended'}` });
  } catch (err) {
    next(err);
  }
}

export async function getPendingProvidersController(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await adminService.getPendingProviders();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function verifyProviderController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { status, notes } = req.body;
    await adminService.verifyProvider(req.params.id, status, notes, req.user.id);
    res.json({ success: true, message: `Provider status updated to ${status}` });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await adminService.getAuditLogs(page, limit);
    res.json({ success: true, data: result.logs, meta: { total: result.total, page, limit } });
  } catch (err) {
    next(err);
  }
}

export async function getSettingsController(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await adminService.getPlatformSettings();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateSettingController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { key, value } = req.body;
    await adminService.updatePlatformSetting(key, value, req.user.id);
    res.json({ success: true, message: 'Platform setting updated' });
  } catch (err) {
    next(err);
  }
}
