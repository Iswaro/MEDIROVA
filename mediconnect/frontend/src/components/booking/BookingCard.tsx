import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ChevronRight, User } from 'lucide-react';
import Card from '../ui/Card';
import BookingStatusBadge from './BookingStatusBadge';

interface BookingCardProps {
  booking: {
    id: string;
    status: string;
    created_at: string;
    scheduled_at?: string;
    category_name?: string;
    quoted_price?: number;
    final_price?: number;
    patient_address_text?: string;
    patient_first_name?: string;
    patient_last_name?: string;
    provider_first_name?: string;
    provider_last_name?: string;
    provider_type?: string;
  };
  role?: 'PATIENT' | 'PROVIDER' | 'ADMIN';
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, role = 'PATIENT' }) => {
  const price = booking.final_price || booking.quoted_price || 2500;
  const isProvider = role === 'PROVIDER';
  const otherParty = isProvider
    ? `${booking.patient_first_name || ''} ${booking.patient_last_name || ''}`.trim() || 'Patient'
    : `${booking.provider_first_name || ''} ${booking.provider_last_name || ''}`.trim() ||
      (booking.status === 'PENDING' ? 'Searching for provider...' : 'Assigned Provider');

  const detailUrl = isProvider
    ? `/provider/bookings/${booking.id}`
    : `/bookings/${booking.id}`;

  return (
    <Card hoverable className="p-5">
      <Link to={detailUrl} className="block">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              {booking.category_name || 'Medical Service'}
            </span>
            <h4 className="text-base font-bold text-gray-900 mt-0.5 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              {otherParty}
              {booking.provider_type && !isProvider && (
                <span className="text-xs font-normal text-gray-500">({booking.provider_type})</span>
              )}
            </h4>
          </div>
          <div className="flex items-center gap-3">
            <BookingStatusBadge status={booking.status} />
            <span className="text-base font-bold text-gray-900">KES {Number(price).toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {new Date(booking.scheduled_at || booking.created_at).toLocaleDateString('en-KE', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {booking.patient_address_text && (
              <span className="flex items-center gap-1 truncate max-w-xs">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{booking.patient_address_text}</span>
              </span>
            )}
          </div>
          <span className="text-primary font-medium flex items-center gap-0.5 hover:underline">
            View Details <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </Card>
  );
};

export default BookingCard;
