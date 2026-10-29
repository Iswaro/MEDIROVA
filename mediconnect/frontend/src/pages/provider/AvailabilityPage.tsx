import React, { useEffect, useState } from 'react';
import { Clock, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { providersApi } from '../../api/providers';

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const AvailabilityPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '17:00',
  });

  const [message, setMessage] = useState<string | null>(null);

  const loadData = () => {
    providersApi.getMyProfile().then(res => {
      if (res.success && res.data) setProfile(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setMessage(null);
    try {
      await providersApi.updateAvailability({
        dayOfWeek: Number(newSlot.dayOfWeek),
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
      } as any);
      setMessage('Availability slot added!');
      loadData();
    } catch {
      setMessage('Error adding slot');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Spinner size="lg" />;

  const slots = profile?.availability || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Availability & Working Hours</h1>
        <p className="text-sm text-gray-500">Configure the days and hours you accept patient service dispatches.</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Add Slot Form */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> Add Available Working Shift
        </h3>

        <form onSubmit={handleAddSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <Select
            label="Day of Week"
            value={newSlot.dayOfWeek}
            onChange={e => setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })}
            options={daysOfWeek}
          />
          <Input
            label="Start Time"
            type="time"
            value={newSlot.startTime}
            onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
            required
          />
          <Input
            label="End Time"
            type="time"
            value={newSlot.endTime}
            onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
            required
          />
          <Button type="submit" isLoading={adding} className="w-full font-bold">
            Add Shift
          </Button>
        </form>
      </Card>

      {/* Current Schedule Grid */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> Active Weekly Schedule
        </h3>

        {slots.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No schedule defined yet. Add your working hours above.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {slots.map((slot: any) => (
              <div key={slot.id} className="py-3 flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800">
                  {daysOfWeek.find(d => d.value === slot.day_of_week)?.label || `Day ${slot.day_of_week}`}
                </span>
                <span className="text-primary font-semibold">
                  {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AvailabilityPage;
