import React from 'react';
import Badge, { BadgeVariant } from '../ui/Badge';
import { BookingStatus } from '../../types';

interface BookingStatusBadgeProps {
  status: BookingStatus | string;
  size?: 'sm' | 'md';
}

const statusVariantMap: Record<string, { variant: BadgeVariant; label: string }> = {
  PENDING: { variant: 'warning', label: 'Matching Provider...' },
  ACCEPTED: { variant: 'info', label: 'Accepted' },
  EN_ROUTE: { variant: 'primary', label: 'En Route' },
  ARRIVED: { variant: 'secondary', label: 'Arrived at Location' },
  IN_PROGRESS: { variant: 'info', label: 'In Progress' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  REJECTED: { variant: 'danger', label: 'Rejected' },
  CANCELLED_BY_PATIENT: { variant: 'gray', label: 'Cancelled by Patient' },
  CANCELLED_BY_PROVIDER: { variant: 'gray', label: 'Cancelled by Provider' },
  EXPIRED: { variant: 'gray', label: 'Request Expired' },
};

const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = statusVariantMap[status] || { variant: 'gray', label: status };

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
};

export default BookingStatusBadge;
