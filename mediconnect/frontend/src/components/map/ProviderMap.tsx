import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface MapLocation {
  id: string;
  name: string;
  type?: string;
  latitude: number;
  longitude: number;
  price?: number;
}

interface ProviderMapProps {
  center?: [number, number];
  zoom?: number;
  providers?: MapLocation[];
  userLocation?: [number, number];
  onSelectProvider?: (id: string) => void;
  className?: string;
}

const ProviderMap: React.FC<ProviderMapProps> = ({
  center = [-1.2921, 36.8219], // Default: Nairobi, Kenya
  zoom = 13,
  providers = [],
  userLocation,
  onSelectProvider,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    let isMounted = true;

    // Dynamically load Leaflet to avoid SSR/bundler issues
    import('leaflet').then(L => {
      if (!isMounted || !mapContainerRef.current) return;

      // If already initialized, clean up first
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
      }

      const map = L.map(mapContainerRef.current).setView(center, zoom);
      mapInstanceRef.current = map;

      // OpenStreetMap Tiles (Free, no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Patient location marker
      if (userLocation) {
        const userIcon = L.divIcon({
          className: 'user-pin',
          html: `<div style="background:#0077B6;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:16px;">📍</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });
        L.marker(userLocation, { icon: userIcon })
          .addTo(map)
          .bindPopup('<b>Your Location</b>');
      }

      // Provider markers
      providers.forEach(p => {
        if (!p.latitude || !p.longitude) return;

        const providerIcon = L.divIcon({
          className: 'provider-pin',
          html: `<div style="background:#10B981;color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.25);font-size:14px;cursor:pointer;">🩺</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });

        const marker = L.marker([p.latitude, p.longitude], { icon: providerIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:sans-serif;padding:4px;">
            <b style="font-size:13px;color:#111827;">${p.name}</b><br/>
            <span style="font-size:11px;color:#0077B6;font-weight:600;">${p.type || 'Healthcare Provider'}</span><br/>
            ${p.price ? `<span style="font-size:12px;font-weight:bold;color:#059669;">KES ${Number(p.price).toLocaleString()}</span><br/>` : ''}
            <button style="margin-top:6px;background:#0077B6;color:white;border:none;padding:4px 8px;border-radius:6px;font-size:11px;cursor:pointer;" onclick="window.__selectProvider && window.__selectProvider('${p.id}')">Select</button>
          </div>
        `);
      });

      // Global callback for leaflet popup button
      (window as unknown as { __selectProvider?: (id: string) => void }).__selectProvider = (id: string) => {
        onSelectProvider?.(id);
      };
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, providers, userLocation, onSelectProvider]);

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-inner border border-gray-200 bg-gray-100 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />
      {providers.length === 0 && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm text-xs text-gray-600 flex items-center gap-1.5 z-[1000]">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          Showing location map (Nairobi, Kenya)
        </div>
      )}
    </div>
  );
};

export default ProviderMap;
