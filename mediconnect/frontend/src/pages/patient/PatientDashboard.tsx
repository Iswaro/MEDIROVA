import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope, Clock, ArrowRight, Plus, Bell, Heart,
  MapPin, Calendar, ChevronRight, Activity,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';
import { bookingsApi } from '../../api/bookings';
import { notificationsApi } from '../../api/notifications';

const SERVICE_TILES = [
  { label: 'Doctor Visit', icon: '🩺', href: '/book?categoryId=1', color: 'from-blue-500 to-cyan-400' },
  { label: 'Nurse Care', icon: '💉', href: '/book?categoryId=2', color: 'from-teal-500 to-emerald-400' },
  { label: 'Telemedicine', icon: '📱', href: '/book?categoryId=3', color: 'from-indigo-500 to-purple-400' },
  { label: 'Lab Tests', icon: '🧪', href: '/book?categoryId=4', color: 'from-orange-500 to-amber-400' },
  { label: 'Pharmacy', icon: '💊', href: '/book?categoryId=5', color: 'from-pink-500 to-rose-400' },
  { label: 'Ambulance', icon: '🚑', href: '/book?categoryId=6', color: 'from-red-500 to-red-400' },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING:     'bg-amber-100 text-amber-700',
  ACCEPTED:    'bg-blue-100 text-blue-700',
  EN_ROUTE:    'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED:   'bg-emerald-100 text-emerald-700',
  CANCELLED_BY_PATIENT: 'bg-gray-100 text-gray-500',
  CANCELLED_BY_PROVIDER: 'bg-gray-100 text-gray-500',
};

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookingsApi.list({ limit: 6 }).catch(() => ({ data: [] })),
      notificationsApi.list({ limit: 4 }).catch(() => ({ data: [] })),
    ]).then(([bRes, nRes]: any) => {
      setBookings(Array.isArray(bRes?.data) ? bRes.data : bRes?.data?.items || []);
      setNotifications(Array.isArray(nRes?.data) ? nRes.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const activeBooking = bookings.find(b =>
    ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(b.status),
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl patient-gradient text-white p-7 shadow-xl">
        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -right-4 w-32 h-32 bg-white/10 rounded-full" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-pink-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-100">Patient Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Welcome back, {user?.firstName || 'there'}! 👋
            </h1>
            <p className="mt-2 text-sm text-blue-100 max-w-sm">
              Book verified healthcare providers at your doorstep or via telemedicine — anytime.
            </p>
          </div>
          <Link
            to="/services"
            className="flex items-center gap-2 bg-white text-primary font-bold px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all shrink-0 text-sm"
          >
            <Plus className="w-4 h-4" /> Request Service
          </Link>
        </div>
      </div>

      {/* ── Active Booking Alert ─────────────────────────────── */}
      {activeBooking && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Active Booking</span>
              <p className="font-bold text-gray-900 dark:text-slate-100">{activeBooking.category_name || 'Medical Service'}</p>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[activeBooking.status] || 'bg-gray-100'}`}>
                {activeBooking.status}
              </span>
            </div>
          </div>
          <Link
            to={`/bookings/${activeBooking.id}`}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors shrink-0"
          >
            Track Live <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ── Quick Service Grid ───────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" /> Book a Service
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {SERVICE_TILES.map(tile => (
            <Link
              key={tile.label}
              to={tile.href}
              className={`bg-gradient-to-br ${tile.color} rounded-2xl p-4 flex flex-col items-center gap-2 text-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all`}
            >
              <span className="text-2xl">{tile.icon}</span>
              <span className="text-[11px] font-bold text-center leading-tight">{tile.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main 3-col grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Bookings – 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Recent Bookings
            </h2>
            <Link to="/bookings" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-[#334155] p-10 text-center">
              <Activity className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">No bookings yet</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Request a medical service to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <Link
                  key={b.id}
                  to={`/bookings/${b.id}`}
                  className="block bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-[#334155] p-4 hover:shadow-md hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-slate-100">
                          {b.category_name || 'Medical Service'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {b.address_text || 'Service location'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[b.status] || 'bg-gray-100 text-gray-500'}`}>
                        {b.status}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-slate-500">
                        {new Date(b.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Notifications + Quick links */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-[#334155] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#334155]">
              <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" /> Notifications
              </h2>
              {notifications.length > 0 && (
                <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </div>
            <div className="p-4 space-y-2">
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-4">No new notifications</p>
              ) : notifications.map((n: any) => (
                <div key={n.id} className="p-3 bg-gray-50 dark:bg-[#334155]/40 rounded-xl">
                  <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{n.title}</p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{n.body || n.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800/40 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Quick Actions</h3>
            {[
              { label: 'Find a Provider', href: '/providers', icon: '🔍' },
              { label: 'My Profile', href: '/patient/profile', icon: '👤' },
              { label: 'Payment History', href: '/bookings', icon: '💳' },
            ].map(item => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center gap-3 p-2.5 bg-white dark:bg-[#1E293B] rounded-xl hover:shadow-sm transition-all group text-sm font-medium text-gray-700 dark:text-slate-300"
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
                <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
