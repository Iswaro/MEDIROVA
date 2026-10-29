import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { bookingsApi } from '../../api/bookings';
import { paymentsApi } from '../../api/payments';
import { useSocket } from '../../context/SocketContext';

const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [booking, setBooking] = useState<any>(null);
  const [existingPayment, setExistingPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'MOCK'>('MOCK');
  const [phone, setPhone] = useState('254712345678');
  const [submitting, setSubmitting] = useState(false);
  const [instruction, setInstruction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      bookingsApi.getById(id),
      paymentsApi.getByBookingId(id).catch(() => ({ success: false, data: null })),
    ])
      .then(([bRes, pRes]: any) => {
        if (bRes.success && bRes.data) setBooking(bRes.data);
        if (pRes.success && pRes.data) setExistingPayment(pRes.data);
      })
      .finally(() => setLoading(false));

    if (socket && id) {
      socket.emit('join:booking', id);
      socket.on('payment:completed', (data: any) => {
        setExistingPayment((prev: any) => ({ ...prev, status: 'COMPLETED', ...data }));
        setSubmitting(false);
        setInstruction(null);
      });

      return () => {
        socket.off('payment:completed');
      };
    }
  }, [id, socket]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await paymentsApi.initiate({
        bookingId: id,
        method: paymentMethod as any,
        mpesaPhone: paymentMethod === 'MPESA' ? phone : undefined,
      });

      if (res.success && res.data) {
        if (res.data.status === 'COMPLETED') {
          setExistingPayment(res.data);
        } else {
          setInstruction(
            (res.data as any).instruction || 'STK Push sent to your phone. Enter M-Pesa PIN to complete.',
          );
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment initiation failed';
      setError(msg);
    } finally {
      if (paymentMethod === 'MOCK') setSubmitting(false);
    }
  };

  if (loading) return <Spinner size="lg" />;
  if (!booking) return <div className="text-center py-12">Booking not found</div>;

  const amount = Number(booking.final_price || booking.quoted_price || 2500);
  const isPaid = existingPayment && existingPayment.status === 'COMPLETED';

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Healthcare Payment</h1>
        <p className="text-xs text-gray-500">M-Pesa Daraja Verified Checkout & Receipt</p>
      </div>

      {isPaid ? (
        <Card className="p-8 text-center space-y-4 bg-emerald-50/50 border-emerald-200">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Payment Completed!</h2>
          <p className="text-xs text-gray-600">
            Payment of <strong>KES {amount.toLocaleString()}</strong> has been verified.
          </p>
          <div className="pt-2">
            <Link to={`/bookings/${booking.id}/receipt`}>
              <Button size="lg" className="font-bold bg-emerald-600 hover:bg-emerald-700">
                View & Print Receipt <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {instruction && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary shrink-0 animate-spin" />
              <span>{instruction}</span>
            </div>
          )}

          {/* Booking Summary */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Service:</span>
              <span className="font-semibold text-gray-900">{booking.category_name || 'Medical Visit'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Provider:</span>
              <span className="font-semibold text-gray-900">
                {booking.provider_first_name
                  ? `${booking.provider_first_name} ${booking.provider_last_name || ''}`
                  : 'Assigned Provider'}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-bold text-gray-900">
              <span>Total Payable</span>
              <span className="text-primary">KES {amount.toLocaleString()}</span>
            </div>
          </div>

          <form onSubmit={handlePay} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('MOCK')}
                  className={`p-3.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'MOCK'
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  Instant Sandbox Mock
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('MPESA')}
                  className={`p-3.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'MPESA'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-extrabold text-sm text-emerald-600">M-PESA</span>
                  Safaricom STK Push
                </button>
              </div>
            </div>

            {paymentMethod === 'MPESA' && (
              <Input
                label="M-Pesa Registered Mobile Number"
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="2547XXXXXXXX"
                leftIcon={<Phone className="w-4 h-4 text-emerald-600" />}
              />
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={submitting}
              className={`font-bold ${
                paymentMethod === 'MPESA' ? 'bg-emerald-600 hover:bg-emerald-700' : ''
              }`}
            >
              {paymentMethod === 'MPESA' ? 'Send M-Pesa STK Prompt' : 'Pay Instantly (Sandbox)'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default PaymentPage;
