import React, { useEffect, useState } from 'react';
import { CreditCard, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/admin';

interface PaymentRecord {
  id: string;
  booking_id: string;
  patient_email?: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  gateway_reference: string;
  paid_at?: string;
  created_at: string;
}

const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPayments();
      const list = Array.isArray(res?.data) ? res.data : (res?.data as any)?.items || [];
      setPayments(list);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async (paymentId: string) => {
    const reason = window.prompt('Please enter the reason for this refund:');
    if (!reason) return;

    setRefundingId(paymentId);
    setMessage(null);
    try {
      await adminApi.refundPayment(paymentId, reason);
      setMessage({ type: 'success', text: `Refund request initiated successfully for ${paymentId.substring(0, 8)}.` });
      fetchPayments();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process refund.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setRefundingId(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
      case 'PROCESSING':
        return 'warning';
      case 'FAILED':
        return 'danger';
      case 'REFUNDED':
        return 'gray';
      default:
        return 'info';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Payments & Settlement Ledger</h1>
          <p className="text-sm text-gray-500">Audit all M-Pesa, card, and platform transactions with webhook reference integrity.</p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchPayments} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <Card className="p-6 overflow-hidden">
        {loading ? (
          <Spinner size="lg" />
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            <CreditCard className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            No transaction records found in the ledger.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-3">Reference / ID</th>
                  <th className="p-3">Booking ID</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Timestamp (UTC)</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-medium text-gray-900">
                      {p.gateway_reference || p.id.substring(0, 8)}
                    </td>
                    <td className="p-3 font-mono text-gray-500">
                      {p.booking_id ? p.booking_id.substring(0, 8) : '—'}
                    </td>
                    <td className="p-3 font-bold text-gray-900">
                      {p.currency || 'KES'} {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 font-semibold text-primary">
                      {p.payment_method}
                    </td>
                    <td className="p-3">
                      <Badge variant={getStatusBadgeVariant(p.status)}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-gray-500">
                      {new Date(p.paid_at || p.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      {p.status === 'COMPLETED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRefund(p.id)}
                          isLoading={refundingId === p.id}
                          className="text-red-600 hover:bg-red-50 text-xs"
                        >
                          Refund
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminPaymentsPage;
