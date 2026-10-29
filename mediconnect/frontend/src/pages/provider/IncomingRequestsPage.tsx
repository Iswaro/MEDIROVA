import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { bookingsApi } from '../../api/bookings';
import { useSocket } from '../../context/SocketContext';

const IncomingRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = () => {
    bookingsApi
      .list({ status: 'PENDING' as any })
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setRequests(list);
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();

    if (socket) {
      socket.on('booking:new', () => {
        fetchRequests();
      });
      socket.on('booking:broadcast', () => {
        fetchRequests();
      });

      return () => {
        socket.off('booking:new');
        socket.off('booking:broadcast');
      };
    }
  }, [socket]);

  const handleAccept = async (bookingId: string) => {
    setError(null);
    setActionLoading(bookingId);
    try {
      await bookingsApi.accept(bookingId);
      navigate(`/provider/bookings/${bookingId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept booking. It may have been taken.';
      setError(msg);
      fetchRequests();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    setError(null);
    setActionLoading(bookingId);
    try {
      await bookingsApi.reject(bookingId, 'Provider declined request');
      fetchRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error declining request';
      setError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Incoming Booking Requests</h1>
        <p className="text-sm text-gray-500">
          Immediate and scheduled dispatch requests from patients in your coverage area.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {requests.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No incoming requests right now"
          description="You will hear a live notification and see requests here as soon as a patient requests your service."
          actionText="Refresh Requests"
          onAction={fetchRequests}
        />
      ) : (
        <div className="space-y-4">
          {requests.map(b => (
            <Card key={b.id} className="p-6 border-l-4 border-l-primary space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    {b.category_name || 'Medical Service'}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                    Patient: {b.patient_first_name} {b.patient_last_name || ''}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block font-medium">Payout to you</span>
                  <span className="text-lg font-black text-emerald-600">
                    KES {Number(b.provider_payout || 2125).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Location:</strong> {b.patient_address_text}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>
                    <strong>Type:</strong> {b.booking_type === 'IMMEDIATE' ? 'Immediate Dispatch' : 'Scheduled'}
                  </span>
                </div>
                {b.notes && (
                  <div className="sm:col-span-2 p-2.5 rounded-lg bg-gray-50 text-gray-700 italic">
                    "{b.notes}"
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReject(b.id)}
                  disabled={actionLoading === b.id}
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-1" /> Decline
                </Button>
                <Button
                  size="md"
                  onClick={() => handleAccept(b.id)}
                  isLoading={actionLoading === b.id}
                  className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Accept & Dispatch
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncomingRequestsPage;
