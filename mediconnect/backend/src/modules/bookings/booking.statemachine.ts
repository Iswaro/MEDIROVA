import { AppError } from '../../middleware/errorHandler';

/**
 * All possible booking statuses.
 */
export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED_BY_PATIENT'
  | 'CANCELLED_BY_PROVIDER'
  | 'EXPIRED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

/**
 * Defines valid status transitions.
 * Key = current status; Value = set of statuses it can transition to.
 */
export const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED_BY_PATIENT', 'EXPIRED'],
  ACCEPTED: ['EN_ROUTE', 'CANCELLED_BY_PATIENT', 'CANCELLED_BY_PROVIDER'],
  EN_ROUTE: ['ARRIVED'],
  ARRIVED: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  REJECTED: [],
  CANCELLED_BY_PATIENT: [],
  CANCELLED_BY_PROVIDER: [],
  EXPIRED: [],
  COMPLETED: [],
};

/**
 * Validates a requested status transition.
 * Throws AppError 422 if the transition is not allowed.
 */
export function assertValidTransition(current: BookingStatus, next: BookingStatus): void {
  const allowed = TRANSITIONS[current];
  if (!allowed || !allowed.includes(next)) {
    throw new AppError(
      `Invalid status transition: ${current} → ${next}. Allowed: [${allowed?.join(', ') ?? 'none'}]`,
      422,
      true,
      'INVALID_TRANSITION',
    );
  }
}

/**
 * Terminal states — no further transitions possible.
 */
export const TERMINAL_STATES: BookingStatus[] = [
  'REJECTED',
  'CANCELLED_BY_PATIENT',
  'CANCELLED_BY_PROVIDER',
  'EXPIRED',
  'COMPLETED',
];

export function isTerminal(status: BookingStatus): boolean {
  return TERMINAL_STATES.includes(status);
}
