import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import type { ProviderLocationEvent } from '../types';

interface ProviderLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export const useProviderLocation = (providerId: string | undefined) => {
  const { socket, joinRoom, leaveRoom } = useSocket();
  const [location, setLocation] = useState<ProviderLocation | null>(null);

  const handleLocationUpdate = useCallback((event: ProviderLocationEvent) => {
    if (event.providerId === providerId) {
      setLocation({
        latitude: event.latitude,
        longitude: event.longitude,
        timestamp: event.timestamp,
      });
    }
  }, [providerId]);

  useEffect(() => {
    if (!socket || !providerId) return;

    const room = `provider:${providerId}`;
    joinRoom(room);

    socket.on('provider:location_updated', handleLocationUpdate);

    return () => {
      socket.off('provider:location_updated', handleLocationUpdate);
      leaveRoom(room);
    };
  }, [socket, providerId, joinRoom, leaveRoom, handleLocationUpdate]);

  return location;
};
