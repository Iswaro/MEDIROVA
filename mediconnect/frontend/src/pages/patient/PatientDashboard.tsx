import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ArrowRight,
  Activity,
  Plus,
  Bell,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import BookingCard from '../../components/booking/BookingCard';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { bookingsApi } from '../../api/bookings';
import { notificationsApi } from '../../api/notifications';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookingsApi.list({ limit: 5 }).catch(() => ({ data: [] })),
      notificationsApi.list({ limit: 5 }).catch(() => ({ data: [] })),
    ]).then(([bRes, nRes]: any) => {
      const bList = Array.isArray(bRes?.data) ? bRes.data : bRes?.data?.items || [];
      const nList = Array.isArray(nRes?.data) ? nRes.data : [];
      setBookings(bList);
      setNotifications(nList);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const activeBooking = bookings.find(b =>
    ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(b.status),
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">Patient Portal</span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            Hello, {user?.firstName || 'there'}!
          </h1>
          <p className="text-sm text-blue-100 mt-1 max-w-md">
            Need medical assistance at home or via telemedicine? Request a verified provider anytime.
          </p>
        </div>
        <Link to="/services">
          <Button size="lg" className="bg-white text-primary hover:bg-blue-50 font-bold shrink-0">
            <Plus className="w-5 h-5 mr-1" /> Request Service
          </Button>
        </Link>
      </div>

      {/* Active Service In-Progress Alert */}
      {activeBooking && (
        <Card className="bg-amber-50 border-amber-200 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Ongoing Booking</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                    {activeBooking.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mt-0.5">
                  {activeBooking.category_name || 'Medical Service Request'}
                </h3>
              </div>
            </div>
            <Link to={`/bookings/${activeBooking.id}`}>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                Track Status & Arrival
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Two Column Layout: Recent Bookings & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Recent Service Bookings
            </h2>
            <Link to="/bookings" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <Spinner />
          ) : bookings.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No bookings yet"
              description="You have not requested any medical services yet. Search for a doctor or nurse near you."
              actionText="Browse Medical Services"
              onAction={() => (window.location.href = '/services')}
            />
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <BookingCard key={b.id} booking={b} role="PATIENT" />
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Notifications & Quick Actions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </h2>
          </div>

          <Card className="p-4 space-y-3">
            {notifications.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No new notifications</p>
            ) : (
              notifications.map((notif: any) => (
                <div key={notif.id} className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-800">{notif.title}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{notif.body}</p>
                </div>
              ))
            )}
          </Card>

          {/* Quick Actions Card */}
          <Card className="p-5 space-y-3 bg-gradient-to-br from-blue-50 to-teal-50 border-blue-100">
            <h3 className="text-sm font-bold text-gray-900">Need Immediate Assistance?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Find doctors or nurses currently online and available for immediate dispatch in Nairobi.
            </p>
            <Link to="/providers?isAvailable=true" className="block">
              <Button size="sm" fullWidth>
                Find Available Providers Now
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
