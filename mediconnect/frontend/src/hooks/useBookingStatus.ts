import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import type { BookingStatus, BookingStatusEvent } from '../types';

interface BookingStatusState {
  status: BookingStatus | null;
  lastUpdate: BookingStatusEvent | null;
  estimatedArrival: number | null;
}

export const useBookingStatus = (bookingId: string | undefined) => {
  const { socket, joinRoom, leaveRoom } = useSocket();
  const [state, setState] = useState<BookingStatusState>({
    status: null,
    lastUpdate: null,
    estimatedArrival: null,
  });

  const handleStatusUpdate = useCallback((event: BookingStatusEvent) => {
    if (event.bookingId === bookingId) {
      setState({
        status: event.status,
        lastUpdate: event,
        estimatedArrival: event.estimatedArrivalMinutes ?? null,
      });
    }
  }, [bookingId]);

  useEffect(() => {
    if (!socket || !bookingId) return;

    const room = `booking:${bookingId}`;
    joinRoom(room);

    socket.on('booking:status_updated', handleStatusUpdate);
    socket.on('booking:accepted', handleStatusUpdate);
    socket.on('booking:completed', handleStatusUpdate);

    return () => {
      socket.off('booking:status_updated', handleStatusUpdate);
      socket.off('booking:accepted', handleStatusUpdate);
      socket.off('booking:completed', handleStatusUpdate);
      leaveRoom(room);
    };
  }, [socket, bookingId, joinRoom, leaveRoom, handleStatusUpdate]);

  return state;
};
