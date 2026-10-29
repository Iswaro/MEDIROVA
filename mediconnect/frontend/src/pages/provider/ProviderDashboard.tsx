import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  CreditCard,
  Star,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import BookingCard from '../../components/booking/BookingCard';
import { providersApi } from '../../api/providers';
import { bookingsApi } from '../../api/bookings';

const ProviderDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [activeAppointments, setActiveAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const loadData = () => {
    Promise.all([
      providersApi.getMyProfile().catch(() => ({ data: null })),
      providersApi.getEarnings().catch(() => ({ data: null })),
      bookingsApi.list({ status: 'PENDING' as any }).catch(() => ({ data: [] })),
      bookingsApi.list().catch(() => ({ data: [] })),
    ])
      .then(([profRes, earnRes, reqRes, allRes]: any) => {
        if (profRes?.data) setProfile(profRes.data);
        if (earnRes?.data) setEarnings(earnRes.data?.summary || earnRes.data);

        const pendings = Array.isArray(reqRes?.data) ? reqRes.data : [];
        setIncomingRequests(pendings);

        const all = Array.isArray(allRes?.data) ? allRes.data : [];
        const actives = all.filter((b: any) =>
          ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(b.status),
        );
        setActiveAppointments(actives);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    setTogglingAvailability(true);
    const newStatus = !profile.is_available;
    try {
      await providersApi.updateProfile({ isAvailable: newStatus } as any);
      setProfile({ ...profile, is_available: newStatus });
    } finally {
      setTogglingAvailability(false);
    }
  };

  if (loading) return <Spinner size="lg" />;

  const isVerified = profile?.verification_status === 'VERIFIED';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner with Online/Offline toggle */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            {profile?.provider_type || 'Healthcare Provider'} Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
            Dr./Practitioner {profile?.first_name} {profile?.last_name}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage incoming patient dispatch requests, verify credentials, and track payouts.
          </p>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
          <span className="text-xs font-bold text-gray-700">Online for Requests:</span>
          <button
            onClick={handleToggleAvailability}
            disabled={togglingAvailability}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
              profile?.is_available
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {profile?.is_available ? (
              <>
                <ToggleRight className="w-4 h-4" /> Available (Online)
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4" /> Offline
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verification Warning if Pending */}
      {!isVerified && (
        <Card className="bg-amber-50 border-amber-200 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900">
                Account Status: {profile?.verification_status || 'PENDING VERIFICATION'}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Your medical practice license and credentials are currently being reviewed by administrators. You can still manage services, but bookings will not be dispatched until verified.
              </p>
              <div className="mt-3">
                <Link to="/provider/credentials">
                  <Button size="sm" variant="outline" className="text-amber-800 border-amber-300 hover:bg-amber-100">
                    Upload/View Credentials
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Today's Earnings</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">
            KES {Number(earnings?.today_earnings || 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">Auto-credited via M-Pesa</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Active Requests</span>
          <span className="text-2xl font-black text-primary mt-1 block">
            {incomingRequests.length}
          </span>
          <Link to="/provider/requests" className="text-[11px] text-primary hover:underline font-medium">
            Review incoming requests →
          </Link>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Completed Visits</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">
            {earnings?.total_completed || 0}
          </span>
          <span className="text-[11px] text-gray-500">Lifetime patient services</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Average Rating</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-black text-gray-900">
              {Number(profile?.average_rating || 0).toFixed(1)}
            </span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[11px] text-gray-500">From {profile?.total_reviews || 0} reviews</span>
        </Card>
      </div>

      {/* Incoming Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Incoming Patient Requests
          </h2>
          <Link to="/provider/requests" className="text-xs font-bold text-primary hover:underline">
            View All ({incomingRequests.length})
          </Link>
        </div>

        {incomingRequests.length === 0 ? (
          <Card className="p-8 text-center text-xs text-gray-400">
            No incoming pending requests at the moment. Make sure your status is toggled to <strong>Available</strong>.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingRequests.slice(0, 4).map(b => (
              <BookingCard key={b.id} booking={b} role="PROVIDER" />
            ))}
          </div>
        )}
      </div>

      {/* Ongoing / Active Appointments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Current Active Appointments
          </h2>
        </div>

        {activeAppointments.length === 0 ? (
          <Card className="p-8 text-center text-xs text-gray-400">
            No active appointments in progress right now.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAppointments.map(b => (
              <BookingCard key={b.id} booking={b} role="PROVIDER" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
