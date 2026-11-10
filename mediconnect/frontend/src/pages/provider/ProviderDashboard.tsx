import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, Calendar, CreditCard, Star, AlertTriangle, ArrowRight,
  ToggleLeft, ToggleRight, Stethoscope, TrendingUp, Users, CheckCircle2,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { providersApi } from '../../api/providers';
import { bookingsApi } from '../../api/bookings';

const STATUS_PILL: Record<string, string> = {
  PENDING:     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ACCEPTED:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  EN_ROUTE:    'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED:   'bg-emerald-100 text-emerald-700',
};

const ProviderDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const load = () => {
    Promise.all([
      providersApi.getMyProfile().catch(() => ({ data: null })),
      providersApi.getEarnings().catch(() => ({ data: null })),
      bookingsApi.list({ status: 'PENDING' as any }).catch(() => ({ data: [] })),
      bookingsApi.list().catch(() => ({ data: [] })),
    ]).then(([p, e, r, a]: any) => {
      if (p?.data) setProfile(p.data);
      if (e?.data) setEarnings(e.data?.summary || e.data);
      setIncoming(Array.isArray(r?.data) ? r.data : []);
      const all = Array.isArray(a?.data) ? a.data : [];
      setActive(all.filter((b: any) => ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async () => {
    if (!profile) return;
    setToggling(true);
    const next = !profile.is_available;
    try {
      await providersApi.updateProfile({ isAvailable: next } as any);
      setProfile({ ...profile, is_available: next });
    } finally { setToggling(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  const isVerified = profile?.verification_status === 'VERIFIED';
  const isOnline = profile?.is_available;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Provider Hero ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl provider-gradient text-white p-7 shadow-xl">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -left-4 w-28 h-28 bg-white/10 rounded-full" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="w-4 h-4 text-emerald-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">
                {profile?.provider_type || 'Healthcare Provider'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : 'Provider'} 🩺
            </h1>
            <p className="mt-1 text-sm text-emerald-100 max-w-sm">
              Manage patient requests, track earnings, and update your availability in real time.
            </p>
          </div>

          {/* Online/Offline Toggle */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all ${
              isOnline
                ? 'bg-white text-emerald-700 hover:bg-emerald-50'
                : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
            }`}
          >
            {isOnline
              ? <><ToggleRight className="w-5 h-5 text-emerald-500" /> Online for Requests</>
              : <><ToggleLeft className="w-5 h-5" /> Go Online</>
            }
          </button>
        </div>
      </div>

      {/* ── Verification Warning ─────────────────────────────── */}
      {!isVerified && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm text-gray-900 dark:text-slate-100">
              Credentials Under Review — Status: {profile?.verification_status || 'PENDING'}
            </p>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">
              Bookings won't be dispatched until your credentials are verified by an admin.
            </p>
            <Link to="/provider/credentials" className="inline-block mt-2 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline">
              Upload Documents →
            </Link>
          </div>
        </div>
      )}

      {/* ── KPI Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Earnings",
            value: `KES ${Number(earnings?.today_earnings || 0).toLocaleString()}`,
            sub: 'Via M-Pesa settlement',
            icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
            accent: 'border-emerald-500',
            vColor: 'text-emerald-600',
          },
          {
            label: 'Pending Requests',
            value: incoming.length,
            sub: 'Awaiting acceptance',
            icon: <Clock className="w-5 h-5 text-amber-500" />,
            accent: 'border-amber-500',
            vColor: 'text-amber-600',
          },
          {
            label: 'Active Now',
            value: active.length,
            sub: 'In progress visits',
            icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
            accent: 'border-blue-500',
            vColor: 'text-blue-600',
          },
          {
            label: 'Avg. Rating',
            value: `${Number(profile?.average_rating || 0).toFixed(1)} ⭐`,
            sub: `${profile?.total_reviews || 0} patient reviews`,
            icon: <Star className="w-5 h-5 text-purple-500" />,
            accent: 'border-purple-500',
            vColor: 'text-purple-600',
          },
        ].map(card => (
          <div key={card.label} className={`bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-[#334155] border-l-4 ${card.accent} p-5 shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{card.label}</span>
              {card.icon}
            </div>
            <span className={`text-2xl font-black ${card.vColor} block`}>{card.value}</span>
            <span className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 block">{card.sub}</span>
          </div>
        ))}
      </div>

      {/* ── 2-col: Requests + Active ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Incoming Requests */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-[#334155] overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#334155] bg-amber-50 dark:bg-amber-900/10">
            <h2 className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Incoming Requests
            </h2>
            <Link to="/provider/requests" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-[#334155]">
            {incoming.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-8 h-8 text-gray-200 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-slate-500">No pending requests</p>
                <p className="text-xs text-gray-300 dark:text-slate-600 mt-1">Toggle status to <strong>Online</strong> to receive requests</p>
              </div>
            ) : incoming.slice(0, 4).map((b: any) => (
              <Link key={b.id} to={`/bookings/${b.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#334155]/40 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">
                    {b.category_name || 'Medical Service'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{b.address_text || 'Patient location'}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_PILL[b.status] || ''}`}>
                    {b.status}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Active Appointments */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-[#334155] overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#334155] bg-blue-50 dark:bg-blue-900/10">
            <h2 className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" /> Active Appointments
            </h2>
            <Link to="/provider/appointments" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-[#334155]">
            {active.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-gray-200 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-slate-500">No active appointments</p>
              </div>
            ) : active.map((b: any) => (
              <Link key={b.id} to={`/bookings/${b.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#334155]/40 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">{b.category_name || 'Medical Service'}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{b.address_text || 'Patient location'}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_PILL[b.status] || ''}`}>
                  {b.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
