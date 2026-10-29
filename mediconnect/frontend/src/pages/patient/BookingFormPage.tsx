import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { categoriesApi } from '../../api/categories';
import { providersApi } from '../../api/providers';
import { patientsApi } from '../../api/patients';
import { bookingsApi } from '../../api/bookings';

const presetAddresses = [
  { label: 'Westlands, Nairobi', lat: -1.2674, lng: 36.8115, text: 'Mpaka Road, Westlands, Nairobi' },
  { label: 'Kilimani, Nairobi', lat: -1.2891, lng: 36.7865, text: 'Argwings Kodhek Rd, Kilimani, Nairobi' },
  { label: 'Karen, Nairobi', lat: -1.3195, lng: 36.7065, text: 'Karen Road, Nairobi' },
  { label: 'Upper Hill, Nairobi', lat: -1.2985, lng: 36.8146, text: 'Hospital Road, Upper Hill, Nairobi' },
  { label: 'Nairobi CBD', lat: -1.286389, lng: 36.817223, text: 'Kenyatta Avenue, CBD, Nairobi' },
];

const BookingFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(searchParams.get('categoryId') || '');
  const [selectedProviderId, setSelectedProviderId] = useState(searchParams.get('providerId') || '');
  const [providerDetails, setProviderDetails] = useState<any>(null);

  const [bookingType, setBookingType] = useState<'IMMEDIATE' | 'SCHEDULED'>('IMMEDIATE');
  const [scheduledAt, setScheduledAt] = useState('');

  // Location
  const [addressText, setAddressText] = useState(presetAddresses[0].text);
  const [latitude, setLatitude] = useState(presetAddresses[0].lat);
  const [longitude, setLongitude] = useState(presetAddresses[0].lng);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoriesApi.list().then(res => {
      const list = Array.isArray(res?.data) ? res.data : [];
      setCategories(list);
      if (!selectedCategoryId && list.length > 0) {
        setSelectedCategoryId(list[0].id);
      }
    });

    if (selectedProviderId) {
      providersApi.getById(selectedProviderId).then(res => {
        if (res.success && res.data) {
          setProviderDetails(res.data);
          if (res.data.services?.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(res.data.services[0].categoryId);
          }
        }
      });
    }

    // Try fetching saved patient addresses
    patientsApi.getAddresses().then(res => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const def: any = res.data.find((a: any) => a.is_default) || res.data[0];
        setAddressText(def.street || def.address_line || '');
        setLatitude(Number(def.latitude));
        setLongitude(Number(def.longitude));
      }
    }).catch(() => {});
  }, [selectedProviderId]);

  const handleSelectPreset = (addr: (typeof presetAddresses)[0]) => {
    setAddressText(addr.text);
    setLatitude(addr.lat);
    setLongitude(addr.lng);
  };

  const quotedPrice = 3000.0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        categoryId: selectedCategoryId,
        providerId: selectedProviderId || undefined,
        bookingType,
        latitude,
        longitude,
        addressText,
        notes: notes || undefined,
        quotedPrice,
        scheduledAt: bookingType === 'SCHEDULED' ? scheduledAt : undefined,
      };

      const res = await bookingsApi.create(payload);
      if (res.success && res.data) {
        navigate(`/bookings/${res.data.id}`);
      } else {
        throw new Error(res.message || 'Failed to create booking');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating booking';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Request Medical Service</h1>
        <p className="text-sm text-gray-500">Fast, on-demand dispatch of licensed healthcare providers.</p>
      </div>

      <Card className="p-6 sm:p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Category */}
          <Select
            label="Select Medical Service"
            required
            value={selectedCategoryId}
            onChange={e => setSelectedCategoryId(e.target.value)}
            options={categories.map(c => ({ value: c.id, label: c.name }))}
          />

          {/* Selected Provider Card if specified */}
          {providerDetails && (
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>
                  Booking with: <strong>{providerDetails.first_name} {providerDetails.last_name}</strong> ({providerDetails.provider_type})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedProviderId('');
                  setProviderDetails(null);
                }}
                className="text-primary hover:underline font-semibold"
              >
                Auto-match instead
              </button>
            </div>
          )}

          {/* Timing: Immediate vs Scheduled */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Timing</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBookingType('IMMEDIATE')}
                className={`py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  bookingType === 'IMMEDIATE'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Clock className="w-4 h-4" /> Immediate Dispatch
              </button>
              <button
                type="button"
                onClick={() => setBookingType('SCHEDULED')}
                className={`py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  bookingType === 'SCHEDULED'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-4 h-4" /> Schedule Ahead
              </button>
            </div>

            {bookingType === 'SCHEDULED' && (
              <div className="mt-3">
                <Input
                  label="Appointment Date & Time"
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Location / Address */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Patient Service Location</label>
            <Input
              value={addressText}
              onChange={e => setAddressText(e.target.value)}
              placeholder="Enter apartment, street name, building..."
              leftIcon={<MapPin className="w-4 h-4 text-gray-400" />}
              required
            />

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-gray-400 py-1">Quick Select:</span>
              {presetAddresses.map(addr => (
                <button
                  key={addr.label}
                  type="button"
                  onClick={() => handleSelectPreset(addr)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    addressText === addr.text
                      ? 'bg-primary text-white border-primary'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                  }`}
                >
                  {addr.label}
                </button>
              ))}
            </div>
          </div>

          {/* Medical Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symptoms / Visit Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Mild fever since yesterday, patient needs blood pressure check and prescription refill."
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Price Summary */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Standard Service Fee</span>
              <span>KES {quotedPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Platform & Insurance Fee</span>
              <span>Included</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-gray-900">
              <span>Estimated Total (KES)</span>
              <span>KES {quotedPrice.toLocaleString()}</span>
            </div>
            <p className="text-[11px] text-gray-400 pt-1">
              <CreditCard className="w-3.5 h-3.5 inline mr-1" />
              Pay safely via M-Pesa once provider is dispatched or upon completion.
            </p>
          </div>

          <Button type="submit" fullWidth size="lg" isLoading={loading} className="font-bold">
            Confirm & Request Provider
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default BookingFormPage;
