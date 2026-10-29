import { BookingStatus, UserRole } from '../types';

/**
 * Determine if a booking can be cancelled based on its current status and the user's role.
 */
export const canCancel = (status: BookingStatus, role: UserRole): boolean => {
  if (role === UserRole.PATIENT) {
    return [BookingStatus.PENDING, BookingStatus.ACCEPTED].includes(status);
  }
  if (role === UserRole.PROVIDER) {
    return status === BookingStatus.ACCEPTED;
  }
  if (role === UserRole.ADMIN) {
    return ![BookingStatus.COMPLETED, BookingStatus.CANCELLED_BY_PATIENT, BookingStatus.CANCELLED_BY_PROVIDER, BookingStatus.EXPIRED].includes(status);
  }
  return false;
};

/**
 * Get a tailwind color class for the booking status badge.
 */
export const getStatusColor = (status: BookingStatus): string => {
  const colors: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [BookingStatus.ACCEPTED]: 'bg-blue-100 text-blue-800',
    [BookingStatus.EN_ROUTE]: 'bg-indigo-100 text-indigo-800',
    [BookingStatus.ARRIVED]: 'bg-purple-100 text-purple-800',
    [BookingStatus.IN_PROGRESS]: 'bg-cyan-100 text-cyan-800',
    [BookingStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [BookingStatus.REJECTED]: 'bg-red-100 text-red-800',
    [BookingStatus.CANCELLED_BY_PATIENT]: 'bg-gray-100 text-gray-800',
    [BookingStatus.CANCELLED_BY_PROVIDER]: 'bg-orange-100 text-orange-800',
    [BookingStatus.EXPIRED]: 'bg-gray-100 text-gray-500',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-800';
};

/**
 * Get a human-readable label for the booking status.
 */
export const getStatusLabel = (status: BookingStatus): string => {
  const labels: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: 'Pending',
    [BookingStatus.ACCEPTED]: 'Accepted',
    [BookingStatus.EN_ROUTE]: 'En Route',
    [BookingStatus.ARRIVED]: 'Arrived',
    [BookingStatus.IN_PROGRESS]: 'In Progress',
    [BookingStatus.COMPLETED]: 'Completed',
    [BookingStatus.REJECTED]: 'Rejected',
    [BookingStatus.CANCELLED_BY_PATIENT]: 'Cancelled by Patient',
    [BookingStatus.CANCELLED_BY_PROVIDER]: 'Cancelled by Provider',
    [BookingStatus.EXPIRED]: 'Expired',
  };
  return labels[status] ?? status;
};

/**
 * Check if a booking status represents a terminal state.
 */
export const isTerminalStatus = (status: BookingStatus): boolean => {
  return [
    BookingStatus.COMPLETED,
    BookingStatus.REJECTED,
    BookingStatus.CANCELLED_BY_PATIENT,
    BookingStatus.CANCELLED_BY_PROVIDER,
    BookingStatus.EXPIRED,
  ].includes(status);
};

/**
 * Get the next valid status transitions for a given status.
 */
export const getNextStatuses = (status: BookingStatus, role: UserRole): BookingStatus[] => {
  if (role === UserRole.PROVIDER) {
    const transitions: Partial<Record<BookingStatus, BookingStatus[]>> = {
      [BookingStatus.ACCEPTED]: [BookingStatus.EN_ROUTE, BookingStatus.CANCELLED_BY_PROVIDER],
      [BookingStatus.EN_ROUTE]: [BookingStatus.ARRIVED],
      [BookingStatus.ARRIVED]: [BookingStatus.IN_PROGRESS],
      [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED],
    };
    return transitions[status] ?? [];
  }
  return [];
};
