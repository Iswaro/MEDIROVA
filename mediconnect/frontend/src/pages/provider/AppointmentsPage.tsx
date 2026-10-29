import React, { useEffect, useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import BookingCard from '../../components/booking/BookingCard';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Select from '../../components/ui/Select';
import { bookingsApi } from '../../api/bookings';

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsApi
      .list()
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setAppointments(list);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? appointments.filter(a => a.status === filter) : appointments;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Assigned Appointments</h1>
          <p className="text-sm text-gray-500">Manage all your assigned, ongoing, and completed patient visits.</p>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="All Appointments"
            options={[
              { value: 'ACCEPTED', label: 'Accepted' },
              { value: 'EN_ROUTE', label: 'En Route' },
              { value: 'ARRIVED', label: 'Arrived' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description="Appointments will appear here when you accept incoming requests."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <BookingCard key={b.id} booking={b} role="PROVIDER" />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
