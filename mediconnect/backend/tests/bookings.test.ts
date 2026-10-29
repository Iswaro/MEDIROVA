import { assertValidTransition } from '../src/modules/bookings/booking.statemachine';
import { AppError } from '../src/middleware/errorHandler';

describe('Booking State Machine', () => {
  it('allows valid PENDING -> ACCEPTED transition', () => {
    expect(() => assertValidTransition('PENDING', 'ACCEPTED')).not.toThrow();
  });

  it('allows valid ACCEPTED -> EN_ROUTE transition', () => {
    expect(() => assertValidTransition('ACCEPTED', 'EN_ROUTE')).not.toThrow();
  });

  it('allows valid EN_ROUTE -> ARRIVED transition', () => {
    expect(() => assertValidTransition('EN_ROUTE', 'ARRIVED')).not.toThrow();
  });

  it('allows valid ARRIVED -> IN_PROGRESS transition', () => {
    expect(() => assertValidTransition('ARRIVED', 'IN_PROGRESS')).not.toThrow();
  });

  it('allows valid IN_PROGRESS -> COMPLETED transition', () => {
    expect(() => assertValidTransition('IN_PROGRESS', 'COMPLETED')).not.toThrow();
  });

  it('allows cancellation from PENDING and ACCEPTED', () => {
    expect(() => assertValidTransition('PENDING', 'CANCELLED_BY_PATIENT')).not.toThrow();
    expect(() => assertValidTransition('ACCEPTED', 'CANCELLED_BY_PROVIDER')).not.toThrow();
  });

  it('rejects invalid direct transition: PENDING -> COMPLETED', () => {
    expect(() => assertValidTransition('PENDING', 'COMPLETED')).toThrow(AppError);
  });

  it('rejects invalid transition: COMPLETED -> IN_PROGRESS', () => {
    expect(() => assertValidTransition('COMPLETED', 'IN_PROGRESS')).toThrow(AppError);
  });

  it('rejects invalid transition: REJECTED -> ACCEPTED', () => {
    expect(() => assertValidTransition('REJECTED', 'ACCEPTED')).toThrow(AppError);
  });
});
