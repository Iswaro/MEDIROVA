import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  CreditCard,
  XCircle,
  Stethoscope,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import BookingTimeline from '../../components/booking/BookingTimeline';
import Spinner from '../../components/ui/Spinner';
import { bookingsApi } from '../../api/bookings';
import { useSocket } from '../../context/SocketContext';

const BookingTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [providerLocation, setProviderLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchBooking = () => {
    if (!id) return;
    bookingsApi
      .getById(id)
      .then(res => {
        if (res.success && res.data) {
          setBooking(res.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooking();

    // Socket real-time subscription
    if (socket && id) {
      socket.emit('join:booking', id);

      socket.on('booking:accepted', (data: any) => {
        setBooking((prev: any) => ({ ...prev, status: 'ACCEPTED', ...data }));
        fetchBooking();
      });

      socket.on('booking:status_updated', (data: any) => {
        setBooking((prev: any) => ({ ...prev, status: data.status }));
        fetchBooking();
      });

      socket.on('booking:completed', () => {
        setBooking((prev: any) => ({ ...prev, status: 'COMPLETED' }));
        fetchBooking();
      });

      socket.on('provider:location', (loc: any) => {
        setProviderLocation({ lat: loc.lat, lng: loc.lng });
      });

      return () => {
        socket.emit('leave:booking', id);
        socket.off('booking:accepted');
        socket.off('booking:status_updated');
        socket.off('booking:completed');
        socket.off('provider:location');
      };
    }
  }, [id, socket]);

  const handleCancel = async () => {
    if (!id) return;
    const confirmCancel = window.confirm('Are you sure you want to cancel this booking request?');
    if (!confirmCancel) return;

    setCancelling(true);
    try {
      await bookingsApi.cancel(id, 'Patient cancelled from tracking view');
      fetchBooking();
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Spinner size="lg" />;
  if (!booking) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Booking not found</h2>
        <Link to="/dashboard">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const canCancel = ['PENDING', 'ACCEPTED'].includes(booking.status);
  const isCompleted = booking.status === 'COMPLETED';
  const providerName = booking.provider_first_name
    ? `${booking.provider_first_name} ${booking.provider_last_name || ''}`
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Booking #{booking.id.substring(0, 8)}
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900">{booking.category_name || 'Medical Service'}</h1>
        </div>
        <BookingStatusBadge status={booking.status} size="md" />
      </div>

      {/* Progress Timeline */}
      <Card className="p-6">
        <BookingTimeline currentStatus={booking.status} />
      </Card>

      {/* Status Hero Message */}
      {booking.status === 'PENDING' && (
        <Card className="p-6 bg-amber-50 border-amber-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-600 animate-spin">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Matching with Verified Healthcare Providers</h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            We are notifying nearby doctors and nurses eligible for your location. As soon as a provider accepts, their arrival details will update here in real time.
          </p>
          {canCancel && (
            <Button variant="danger" size="sm" onClick={handleCancel} isLoading={cancelling}>
              Cancel Request
            </Button>
          )}
        </Card>
      )}

      {/* Assigned Provider Details */}
      {providerName && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Assigned Provider</h3>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Verified Medical Professional
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-4">
              <Avatar name={providerName} size="lg" />
              <div>
                <h4 className="text-base font-bold text-gray-900">{providerName}</h4>
                <p className="text-xs text-primary font-medium">{booking.provider_type}</p>
                {booking.provider_phone && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" /> {booking.provider_phone}
                  </p>
                )}
              </div>
            </div>

            {booking.provider_phone && (
              <a href={`tel:${booking.provider_phone}`}>
                <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Call Provider
                </Button>
              </a>
            )}
          </div>
        </Card>
      )}

      {/* Service Details & Address */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Service Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-gray-400 font-medium">Service Destination</span>
            <p className="font-semibold text-gray-800 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              {booking.patient_address_text}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 font-medium">Timing</span>
            <p className="font-semibold text-gray-800">
              {booking.booking_type === 'IMMEDIATE'
                ? 'Immediate On-Demand Dispatch'
                : `Scheduled: ${new Date(booking.scheduled_at).toLocaleString()}`}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 font-medium">Quoted Total</span>
            <p className="text-base font-bold text-gray-900">
              KES {Number(booking.final_price || booking.quoted_price || 2500).toLocaleString()}
            </p>
          </div>
          {booking.notes && (
            <div className="space-y-1">
              <span className="text-gray-400 font-medium">Patient Notes</span>
              <p className="font-medium text-gray-700">{booking.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Action Footer: Pay or Cancel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {canCancel ? (
          <Button variant="ghost" onClick={handleCancel} isLoading={cancelling} className="text-red-600 hover:bg-red-50">
            <XCircle className="w-4 h-4 mr-1" /> Cancel Booking
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isCompleted ? (
            <Link to={`/bookings/${booking.id}/pay`} className="w-full sm:w-auto">
              <Button size="lg" className="w-full font-bold shadow-md shadow-primary/20">
                <CreditCard className="w-4 h-4 mr-1.5" /> Pay Now with M-Pesa / Receipt
              </Button>
            </Link>
          ) : (
            <Link to={`/bookings/${booking.id}/pay`} className="w-full sm:w-auto">
              <Button size="md" variant="outline" className="w-full">
                <CreditCard className="w-4 h-4 mr-1.5" /> View Payment Options
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingTrackingPage;
