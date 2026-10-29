import React, { useEffect, useState } from 'react';
import { CreditCard, Calendar, CheckCircle2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { providersApi } from '../../api/providers';

const EarningsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    providersApi.getEarnings().then(res => {
      if (res.success && res.data) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner size="lg" />;

  const summary = data?.summary || {};
  const history = data?.history || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Earnings & Settlements</h1>
        <p className="text-sm text-gray-500">Track patient service revenue, platform commissions, and payout records.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Total Net Earnings
          </span>
          <span className="text-3xl font-black text-emerald-700 mt-2 block">
            KES {Number(summary.total_earnings || 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-600 mt-1 block">Net provider revenue</span>
        </Card>

        <Card className="p-6">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Today's Earnings</span>
          <span className="text-3xl font-black text-gray-900 mt-2 block">
            KES {Number(summary.today_earnings || 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-500 mt-1 block">Completed visits today</span>
        </Card>

        <Card className="p-6">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">This Week</span>
          <span className="text-3xl font-black text-primary mt-2 block">
            KES {Number(summary.week_earnings || 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-500 mt-1 block">Current week total</span>
        </Card>
      </div>

      {/* Transaction History Table */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" /> Payout & Service Transaction History
        </h3>

        {history.length === 0 ? (
          <p className="text-xs text-gray-400 py-8 text-center">No completed transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Gross</th>
                  <th className="p-3">Commission (15%)</th>
                  <th className="p-3 text-right">Net Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {history.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      {new Date(tx.completed_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-semibold text-gray-900">{tx.service_name}</td>
                    <td className="p-3">{tx.first_name} {tx.last_name || ''}</td>
                    <td className="p-3">KES {Number(tx.final_price).toLocaleString()}</td>
                    <td className="p-3 text-gray-400">KES {Number(tx.platform_commission).toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-emerald-600">
                      KES {Number(tx.provider_payout).toLocaleString()}
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

export default EarningsPage;
