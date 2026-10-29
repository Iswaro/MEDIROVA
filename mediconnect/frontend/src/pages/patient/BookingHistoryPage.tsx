import React, { useEffect, useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import BookingCard from '../../components/booking/BookingCard';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Select from '../../components/ui/Select';
import { patientsApi } from '../../api/patients';

const BookingHistoryPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    patientsApi
      .getBookings()
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : (res?.data as any)?.items || [];
        setBookings(list);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterStatus
    ? bookings.filter(b => b.status === filterStatus)
    : bookings;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Booking History</h1>
          <p className="text-sm text-gray-500">View and track all your medical service appointments.</p>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            placeholder="All Statuses"
            options={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'ACCEPTED', label: 'Accepted' },
              { value: 'EN_ROUTE', label: 'En Route' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED_BY_PATIENT', label: 'Cancelled' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          description={filterStatus ? 'No bookings match the selected status filter.' : 'You have not booked any healthcare services yet.'}
          actionText={filterStatus ? 'Show All Bookings' : 'Book a Medical Service'}
          onAction={() => {
            if (filterStatus) setFilterStatus('');
            else window.location.href = '/services';
          }}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <BookingCard key={b.id} booking={b} role="PATIENT" />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistoryPage;
