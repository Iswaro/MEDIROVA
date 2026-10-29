import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  Activity,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import BookingTimeline from '../../components/booking/BookingTimeline';
import Spinner from '../../components/ui/Spinner';
import { bookingsApi } from '../../api/bookings';
import { useSocket } from '../../context/SocketContext';

const ProviderBookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = () => {
    if (!id) return;
    bookingsApi
      .getById(id)
      .then(res => {
        if (res.success && res.data) setBooking(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooking();

    if (socket && id) {
      socket.emit('join:booking', id);
      return () => {
        socket.emit('leave:booking', id);
      };
    }
  }, [id, socket]);

  const handleUpdateStatus = async (nextStatus: any) => {
    if (!id) return;
    setError(null);
    setUpdating(true);
    try {
      if (nextStatus === 'COMPLETED') {
        await bookingsApi.complete(id);
      } else {
        await bookingsApi.updateStatus(id, nextStatus);
      }
      fetchBooking();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      setError(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Spinner size="lg" />;
  if (!booking) return <div className="text-center py-12">Booking not found</div>;

  const currentStatus = booking.status;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/provider/appointments"
          className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> All Appointments
        </Link>
        <BookingStatusBadge status={currentStatus} size="md" />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Timeline */}
      <Card className="p-6">
        <BookingTimeline currentStatus={currentStatus} />
      </Card>

      {/* Provider Action Buttons based on state machine */}
      <Card className="p-6 bg-slate-900 text-white space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
            Appointment Control Panel
          </span>
          <span className="text-xs text-gray-300">Current Step: {currentStatus}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {currentStatus === 'ACCEPTED' && (
            <Button
              size="lg"
              onClick={() => handleUpdateStatus('EN_ROUTE')}
              isLoading={updating}
              className="bg-primary hover:bg-primary-dark font-bold"
            >
              <Navigation className="w-4 h-4 mr-2" /> Start Travelling (En Route)
            </Button>
          )}

          {currentStatus === 'EN_ROUTE' && (
            <Button
              size="lg"
              onClick={() => handleUpdateStatus('ARRIVED')}
              isLoading={updating}
              className="bg-teal-500 hover:bg-teal-600 font-bold"
            >
              <MapPin className="w-4 h-4 mr-2" /> Mark Arrived at Patient
            </Button>
          )}

          {currentStatus === 'ARRIVED' && (
            <Button
              size="lg"
              onClick={() => handleUpdateStatus('IN_PROGRESS')}
              isLoading={updating}
              className="bg-blue-600 hover:bg-blue-700 font-bold"
            >
              <Activity className="w-4 h-4 mr-2" /> Start Examination / Care
            </Button>
          )}

          {currentStatus === 'IN_PROGRESS' && (
            <Button
              size="lg"
              onClick={() => handleUpdateStatus('COMPLETED')}
              isLoading={updating}
              className="bg-emerald-600 hover:bg-emerald-700 font-bold"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Complete & Finalize Service
            </Button>
          )}

          {currentStatus === 'COMPLETED' && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5" /> Service successfully completed and billed.
            </div>
          )}
        </div>
      </Card>

      {/* Patient Details & Location */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Patient & Destination</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-gray-400 font-medium">Patient Name</span>
            <p className="text-sm font-bold text-gray-900">
              {booking.patient_first_name} {booking.patient_last_name || ''}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 font-medium">Patient Phone</span>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">{booking.patient_phone || '+254700000000'}</p>
              {booking.patient_phone && (
                <a href={`tel:${booking.patient_phone}`} className="text-primary hover:underline font-bold">
                  Call
                </a>
              )}
            </div>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <span className="text-gray-400 font-medium">Destination Address</span>
            <p className="font-semibold text-gray-800 flex items-start gap-1">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              {booking.patient_address_text}
            </p>
          </div>

          {booking.notes && (
            <div className="space-y-1 sm:col-span-2 p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-400 font-medium block">Patient Notes / Symptoms</span>
              <p className="font-medium text-gray-700">{booking.notes}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProviderBookingDetailPage;
