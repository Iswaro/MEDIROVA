import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import BookingCard from '../../components/booking/BookingCard';
import Spinner from '../../components/ui/Spinner';
import Select from '../../components/ui/Select';
import { bookingsApi } from '../../api/bookings';

const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    bookingsApi
      .list({ status: (filter as any) || undefined })
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setBookings(list);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Platform Booking Oversight</h1>
          <p className="text-sm text-gray-500">Monitor all patient service dispatches, live statuses, and historical records.</p>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="All Statuses"
            options={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'ACCEPTED', label: 'Accepted' },
              { value: 'EN_ROUTE', label: 'En Route' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED_BY_PATIENT', label: 'Cancelled' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : bookings.length === 0 ? (
        <Card className="p-8 text-center text-xs text-gray-400">No bookings match the filter criteria.</Card>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <BookingCard key={b.id} booking={b} role="ADMIN" />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
