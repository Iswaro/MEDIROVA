import React from 'react';
import { CheckCircle2, Clock, MapPin, Stethoscope, Award } from 'lucide-react';
import { BookingStatus } from '../../types';

interface BookingTimelineProps {
  currentStatus: BookingStatus | string;
  className?: string;
}

const steps = [
  { status: 'PENDING', label: 'Requested', icon: Clock },
  { status: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2 },
  { status: 'EN_ROUTE', label: 'En Route', icon: MapPin },
  { status: 'ARRIVED', label: 'Arrived', icon: MapPin },
  { status: 'IN_PROGRESS', label: 'In Progress', icon: Stethoscope },
  { status: 'COMPLETED', label: 'Completed', icon: Award },
];

const statusOrder = steps.map(s => s.status);

const BookingTimeline: React.FC<BookingTimelineProps> = ({ currentStatus, className = '' }) => {
  const isCancelled =
    currentStatus.startsWith('CANCELLED') || currentStatus === 'REJECTED' || currentStatus === 'EXPIRED';
  const currentIndex = statusOrder.indexOf(currentStatus);

  if (isCancelled) {
    return (
      <div className={`p-4 bg-gray-50 rounded-xl border border-gray-200 text-center ${className}`}>
        <p className="text-sm font-semibold text-gray-700">
          Booking status: <span className="text-red-600">{currentStatus.replace(/_/g, ' ')}</span>
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full py-4 ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200 -z-0" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-primary transition-all duration-500 -z-0"
          style={{
            width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%`,
          }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = currentIndex > idx;
          const isCurrent = currentIndex === idx;

          return (
            <div key={step.status} className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-primary text-white shadow-sm'
                    : isCurrent
                    ? 'bg-white border-2 border-primary text-primary ring-4 ring-primary/20 shadow-md'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isCurrent ? 'text-primary font-bold' : isDone ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingTimeline;
