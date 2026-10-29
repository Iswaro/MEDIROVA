import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Printer,
  CheckCircle2,
  Calendar,
  CreditCard,
  User,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { bookingsApi } from '../../api/bookings';
import { paymentsApi } from '../../api/payments';

const ReceiptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      bookingsApi.getById(id),
      paymentsApi.getByBookingId(id).catch(() => ({ success: false, data: null })),
    ])
      .then(([bRes, pRes]: any) => {
        if (bRes.success && bRes.data) setBooking(bRes.data);
        if (pRes.success && pRes.data) setPayment(pRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size="lg" />;
  if (!booking) return <div className="text-center py-12">Booking not found</div>;

  const handlePrint = () => {
    window.print();
  };

  const amount = Number(booking.final_price || booking.quoted_price || 2500);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between no-print">
        <Link to="/dashboard" className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
        <Button size="sm" variant="outline" onClick={handlePrint} className="flex items-center gap-1.5">
          <Printer className="w-4 h-4" /> Print Receipt
        </Button>
      </div>

      <Card className="p-8 sm:p-10 border border-gray-200 shadow-md space-y-8 bg-white print:shadow-none print:border-none">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold text-gray-900 tracking-tight">
                MEDI<span className="text-primary">CONNECT</span>
              </span>
            </div>
            <p className="text-xs text-gray-400">Official Electronic Healthcare Service Receipt</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> PAID
            </span>
            <p className="text-[11px] text-gray-400 mt-1">Receipt #{id?.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Transaction Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block font-medium">Issue Date</span>
            <span className="font-bold text-gray-900">
              {new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Payment Gateway</span>
            <span className="font-bold text-gray-900">
              {payment?.payment_method || 'M-Pesa / Mock Gateway'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Reference Code</span>
            <span className="font-bold text-gray-900 truncate block">
              {payment?.gateway_reference || 'MED-CONF-OK'}
            </span>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-3">Service Description</th>
                <th className="p-3">Provider</th>
                <th className="p-3 text-right">Amount (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              <tr>
                <td className="p-3 font-semibold">{booking.category_name || 'Medical Consultation'}</td>
                <td className="p-3">
                  {booking.provider_first_name
                    ? `${booking.provider_first_name} ${booking.provider_last_name || ''}`
                    : 'Verified Provider'}
                </td>
                <td className="p-3 text-right font-bold">{amount.toLocaleString()}.00</td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-100 font-bold text-gray-900">
              <tr>
                <td colSpan={2} className="p-3 text-right">
                  Total Paid
                </td>
                <td className="p-3 text-right text-primary text-sm">KES {amount.toLocaleString()}.00</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-gray-100 text-center text-[11px] text-gray-400 space-y-1">
          <p>Thank you for choosing MEDICONNECT. All services delivered by licensed practitioners.</p>
          <p>Questions? Contact support@mediconnect.ke or 24/7 helpline.</p>
        </div>
      </Card>
    </div>
  );
};

export default ReceiptPage;
