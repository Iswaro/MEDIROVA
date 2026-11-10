import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ShieldCheck, Calendar, CreditCard,
  TrendingUp, AlertCircle, ArrowRight, Settings,
  BarChart3, Eye, Lock, FileText,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/admin';

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then(res => { if (res.success && res.data) setMetrics(res.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  const users = metrics?.users || {};
  const bookings = metrics?.bookings || {};
  const finances = metrics?.finances || {};

  const kpis = [
    {
      label: 'Total Users',
      value: users.total || 0,
      sub: `${users.patients || 0} patients · ${users.providers || 0} providers`,
      icon: <Users className="w-5 h-5 text-violet-500" />,
      accent: 'border-l-violet-500',
      vColor: 'text-violet-700 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/10',
    },
    {
      label: 'Pending Verifications',
      value: users.pendingVerification || 0,
      sub: 'Credentials to review',
      icon: <ShieldCheck className="w-5 h-5 text-amber-500" />,
      accent: 'border-l-amber-500',
      vColor: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/10',
      href: '/admin/verifications',
    },
    {
      label: 'Total Bookings',
      value: bookings.total_bookings || 0,
      sub: `${bookings.completed || 0} completed · ${bookings.active || 0} active`,
      icon: <Calendar className="w-5 h-5 text-blue-500" />,
      accent: 'border-l-blue-500',
      vColor: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/10',
    },
    {
      label: 'Platform Revenue',
      value: `KES ${Number(finances.totalPlatformCommission || 0).toLocaleString()}`,
      sub: `From KES ${Number(finances.totalGrossVolume || 0).toLocaleString()} gross`,
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      accent: 'border-l-emerald-500',
      vColor: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
    },
  ];

  const quickActions = [
    { label: 'Provider Verifications', desc: 'Review medical licenses, degrees, and permits before granting dispatch access.', icon: <ShieldCheck className="w-7 h-7 text-violet-500" />, href: '/admin/verifications', badge: users.pendingVerification || 0 },
    { label: 'User Management', desc: 'View, suspend, or reactivate patient and provider accounts.', icon: <Users className="w-7 h-7 text-blue-500" />, href: '/admin/users', badge: 0 },
    { label: 'Booking Oversight', desc: 'Monitor all platform bookings, resolve disputes, force-cancel if needed.', icon: <Calendar className="w-7 h-7 text-teal-500" />, href: '/admin/bookings', badge: 0 },
    { label: 'Payments & Refunds', desc: 'Inspect M-Pesa transactions, verify webhooks, approve refund requests.', icon: <CreditCard className="w-7 h-7 text-emerald-500" />, href: '/admin/payments', badge: 0 },
    { label: 'Audit Logs', desc: 'Full audit trail of all admin, provider, and patient actions.', icon: <FileText className="w-7 h-7 text-gray-500" />, href: '/admin/audit', badge: 0 },
    { label: 'Platform Settings', desc: 'Configure service areas, commission rates, and platform-wide rules.', icon: <Settings className="w-7 h-7 text-indigo-500" />, href: '/admin/settings', badge: 0 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Admin Hero ───────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl admin-gradient text-white p-7 shadow-xl">
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/10 rounded-full" />
        <div className="absolute top-4 right-24 w-16 h-16 bg-white/5 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-purple-200" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-100">Admin Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Platform Operations 🛡️</h1>
          <p className="mt-2 text-sm text-purple-100 max-w-lg">
            Real-time oversight of verified providers, patient bookings, M-Pesa transactions, and security audit logs.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link to="/admin/verifications" className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
              <Eye className="w-3.5 h-3.5" /> Review Verifications
            </Link>
            <Link to="/admin/users" className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
              <Users className="w-3.5 h-3.5" /> Manage Users
            </Link>
            <Link to="/admin/payments" className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
              <CreditCard className="w-3.5 h-3.5" /> Payments
            </Link>
          </div>
        </div>
      </div>

      {/* ── Alert: Pending Verifications ─────────────────────── */}
      {(users.pendingVerification || 0) > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-slate-100">
                {users.pendingVerification} provider credential{users.pendingVerification > 1 ? 's' : ''} awaiting review
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Review and approve before they can accept patient bookings</p>
            </div>
          </div>
          <Link to="/admin/verifications" className="shrink-0 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
            Review Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ── KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`${k.bg} border border-l-4 ${k.accent} border-gray-100 dark:border-[#334155] rounded-2xl p-5 shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{k.label}</span>
              {k.icon}
            </div>
            <span className={`text-3xl font-black ${k.vColor} block`}>{k.value}</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-gray-500 dark:text-slate-400">{k.sub}</span>
              {k.href && (
                <Link to={k.href} className="text-[11px] font-bold text-primary hover:underline">View →</Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Analytics Row ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-[#334155] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-5 h-5 text-violet-500" />
          <h2 className="font-bold text-gray-900 dark:text-slate-100">Platform Overview</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: 'Completion Rate', value: bookings.total_bookings ? `${Math.round(((bookings.completed || 0) / bookings.total_bookings) * 100)}%` : '—', color: 'text-emerald-600' },
            { label: 'Active Right Now', value: bookings.active || 0, color: 'text-blue-600' },
            { label: 'Cancelled', value: bookings.cancelled || 0, color: 'text-red-500' },
            { label: 'Gross Volume', value: `KES ${Number(finances.totalGrossVolume || 0).toLocaleString()}`, color: 'text-violet-600' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <span className={`text-2xl font-black ${stat.color} block`}>{stat.value}</span>
              <span className="text-xs text-gray-500 dark:text-slate-400 mt-1 block">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Action Grid ─────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map(action => (
            <Link
              key={action.label}
              to={action.href}
              className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-[#334155] p-5 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-700 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-50 dark:bg-[#334155] rounded-xl group-hover:bg-violet-50 dark:group-hover:bg-violet-900/20 transition-colors">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-slate-100">{action.label}</h3>
                    {action.badge > 0 && (
                      <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{action.badge}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 transition-colors shrink-0 mt-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
