import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  Calendar,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Activity,
  ArrowRight,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/admin';

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getDashboard()
      .then(res => {
        if (res.success && res.data) setMetrics(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" />;

  const users = metrics?.users || {};
  const bookings = metrics?.bookings || {};
  const finances = metrics?.finances || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <span className="text-xs font-bold text-primary uppercase tracking-wider">Administration Console</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
          Platform Operations & Metrics
        </h1>
        <p className="text-sm text-gray-500">
          Real-time oversight of verified providers, bookings, M-Pesa volume, and security audit logs.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-primary">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Users</span>
          <span className="text-3xl font-black text-gray-900 mt-2 block">{users.total || 0}</span>
          <span className="text-[11px] text-gray-500 mt-1 block">
            {users.patients || 0} Patients · {users.providers || 0} Providers
          </span>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Pending Verifications</span>
          <span className="text-3xl font-black text-amber-600 mt-2 block">
            {users.pendingVerification || 0}
          </span>
          <Link to="/admin/verifications" className="text-[11px] text-primary hover:underline font-semibold mt-1 block">
            Review licenses & credentials →
          </Link>
        </Card>

        <Card className="p-5 border-l-4 border-l-blue-500">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Bookings</span>
          <span className="text-3xl font-black text-gray-900 mt-2 block">
            {bookings.total_bookings || 0}
          </span>
          <span className="text-[11px] text-gray-500 mt-1 block">
            {bookings.completed || 0} Completed · {bookings.active || 0} Active
          </span>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Platform Commission</span>
          <span className="text-3xl font-black text-emerald-600 mt-2 block">
            KES {Number(finances.totalPlatformCommission || 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-500 mt-1 block">
            From KES {Number(finances.totalGrossVolume || 0).toLocaleString()} gross
          </span>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card hoverable className="p-6 space-y-3">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h3 className="text-base font-bold text-gray-900">Provider Verifications</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Verify doctor licenses, nursing diplomas, and pharmacy certifications before granting dispatch access.
          </p>
          <Link to="/admin/verifications" className="inline-flex items-center gap-1 text-xs font-bold text-primary pt-2">
            Open Verifications <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card hoverable className="p-6 space-y-3">
          <Users className="w-8 h-8 text-secondary-dark" />
          <h3 className="text-base font-bold text-gray-900">User Management</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            View patient and provider accounts, review registration dates, and suspend or reactivate users.
          </p>
          <Link to="/admin/users" className="inline-flex items-center gap-1 text-xs font-bold text-primary pt-2">
            Manage Users <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card hoverable className="p-6 space-y-3">
          <CreditCard className="w-8 h-8 text-emerald-600" />
          <h3 className="text-base font-bold text-gray-900">Payments & Refunds</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Inspect all M-Pesa transactions, review webhook verification signatures, and approve refund requests.
          </p>
          <Link to="/admin/payments" className="inline-flex items-center gap-1 text-xs font-bold text-primary pt-2">
            View Transactions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
