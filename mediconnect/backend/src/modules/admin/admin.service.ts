import { RowDataPacket } from 'mysql2';
import { query, execute } from '../../db/pool';
import { AppError } from '../../middleware/errorHandler';
import { logAuditEvent } from '../../middleware/auditLog';
import { sendNotification } from '../notifications/notification.service';

export async function getDashboardMetrics() {
  const [usersCount] = await query<RowDataPacket>('SELECT COUNT(*) AS total FROM users');
  const [patientsCount] = await query<RowDataPacket>("SELECT COUNT(*) AS total FROM users WHERE role = 'PATIENT'");
  const [providersCount] = await query<RowDataPacket>("SELECT COUNT(*) AS total FROM users WHERE role = 'PROVIDER'");
  const [pendingVerifications] = await query<RowDataPacket>(
    "SELECT COUNT(*) AS total FROM provider_profiles WHERE verification_status = 'PENDING'",
  );
  const [bookingsStats] = await query<RowDataPacket>(
    `SELECT 
       COUNT(*) AS total_bookings,
       SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN status IN ('ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS') THEN 1 ELSE 0 END) AS active,
       SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
       SUM(CASE WHEN status LIKE 'CANCELLED%' THEN 1 ELSE 0 END) AS cancelled
     FROM bookings`,
  );
  const [financialStats] = await query<RowDataPacket>(
    `SELECT 
       COALESCE(SUM(amount), 0) AS total_gross_volume,
       COALESCE(SUM(CASE WHEN DATE(paid_at) = CURDATE() THEN amount ELSE 0 END), 0) AS today_volume
     FROM payments WHERE status = 'COMPLETED'`,
  );
  const [commissionStats] = await query<RowDataPacket>(
    `SELECT 
       COALESCE(SUM(platform_commission), 0) AS total_commission,
       COALESCE(SUM(provider_payout), 0) AS total_payouts
     FROM bookings WHERE status = 'COMPLETED'`,
  );

  return {
    users: {
      total: Number(usersCount?.total || 0),
      patients: Number(patientsCount?.total || 0),
      providers: Number(providersCount?.total || 0),
      pendingVerification: Number(pendingVerifications?.total || 0),
    },
    bookings: bookingsStats,
    finances: {
      totalGrossVolume: Number(financialStats?.total_gross_volume || 0),
      todayVolume: Number(financialStats?.today_volume || 0),
      totalPlatformCommission: Number(commissionStats?.total_commission || 0),
      totalProviderPayouts: Number(commissionStats?.total_payouts || 0),
    },
  };
}

export async function getUsers(role?: string, search?: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  let where = 'WHERE 1=1';
  const params: unknown[] = [];

  if (role) {
    where += ' AND u.role = ?';
    params.push(role);
  }
  if (search) {
    where += ' AND (u.email LIKE ? OR u.phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const users = await query<RowDataPacket>(
    `SELECT u.id, u.email, u.phone, u.role, u.is_active, u.created_at, u.last_login_at,
            COALESCE(pp.first_name, prov.first_name) AS first_name,
            COALESCE(pp.last_name, prov.last_name) AS last_name,
            prov.provider_type,
            prov.verification_status
     FROM users u
     LEFT JOIN patient_profiles pp ON pp.user_id = u.id
     LEFT JOIN provider_profiles prov ON prov.user_id = u.id
     ${where}
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [count] = await query<RowDataPacket>(`SELECT COUNT(*) AS total FROM users u ${where}`, params);

  return { users, total: Number(count?.total || 0), page, limit };
}

export async function toggleUserStatus(userId: string, isActive: boolean, adminUserId: string) {
  await execute('UPDATE users SET is_active = ?, updated_at = UTC_TIMESTAMP() WHERE id = ?', [
    isActive ? 1 : 0,
    userId,
  ]);
  await logAuditEvent(adminUserId, isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED', 'users', userId);
}

export async function getPendingProviders() {
  const providers = await query<RowDataPacket>(
    `SELECT pp.id AS profile_id, pp.user_id, pp.provider_type, pp.first_name, pp.last_name,
            pp.business_name, pp.bio, pp.verification_status, pp.created_at,
            u.email, u.phone
     FROM provider_profiles pp
     JOIN users u ON u.id = pp.user_id
     WHERE pp.verification_status IN ('PENDING', 'UNDER_REVIEW')
     ORDER BY pp.created_at ASC`,
  );

  // Fetch credentials for each pending provider
  for (const p of providers) {
    const creds = await query<RowDataPacket>(
      'SELECT * FROM provider_credentials WHERE provider_id = ?',
      [p.profile_id],
    );
    p.credentials = creds;
  }

  return providers;
}

export async function verifyProvider(
  profileId: string,
  status: 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW',
  notes: string,
  adminUserId: string,
) {
  const [provider] = await query<RowDataPacket>(
    'SELECT user_id FROM provider_profiles WHERE id = ?',
    [profileId],
  );
  if (!provider) throw new AppError('Provider profile not found', 404);

  await execute(
    `UPDATE provider_profiles
     SET verification_status = ?, verification_notes = ?, updated_at = UTC_TIMESTAMP()
     WHERE id = ?`,
    [status, notes, profileId],
  );

  // Mark all credentials as verified if approved
  if (status === 'VERIFIED') {
    await execute(
      'UPDATE provider_credentials SET verified_at = UTC_TIMESTAMP(), verified_by_user_id = ? WHERE provider_id = ?',
      [adminUserId, profileId],
    );
  }

  await sendNotification({
    userId: provider.user_id,
    type: 'PROVIDER_VERIFICATION',
    title: `Account Verification: ${status}`,
    body: `Your provider account verification status is now: ${status}. ${notes ? `Note: ${notes}` : ''}`,
  });

  await logAuditEvent(adminUserId, `PROVIDER_${status}`, 'provider_profiles', profileId, { notes });
}

export async function getAuditLogs(page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  const logs = await query<RowDataPacket>(
    `SELECT al.*, u.email AS user_email, u.role AS user_role
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.user_id
     ORDER BY al.created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset],
  );
  const [count] = await query<RowDataPacket>('SELECT COUNT(*) AS total FROM audit_logs');
  return { logs, total: Number(count?.total || 0), page, limit };
}

export async function getPlatformSettings() {
  return query<RowDataPacket>('SELECT * FROM platform_settings ORDER BY `key` ASC');
}

export async function updatePlatformSetting(key: string, value: string, adminUserId: string) {
  await execute(
    'UPDATE platform_settings SET value = ?, updated_by_user_id = ?, updated_at = UTC_TIMESTAMP() WHERE `key` = ?',
    [value, adminUserId, key],
  );
  await logAuditEvent(adminUserId, 'SETTING_UPDATED', 'platform_settings', undefined, { key, value });
}
