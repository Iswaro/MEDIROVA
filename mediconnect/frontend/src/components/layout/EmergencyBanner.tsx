import React, { useState } from 'react';
import { AlertTriangle, Phone, X } from 'lucide-react';

const EmergencyBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-red-600 text-white text-xs sm:text-sm px-4 py-2.5 flex items-center justify-between shadow-inner">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <AlertTriangle className="w-4 h-4 shrink-0 text-red-200 animate-pulse" />
        <p className="flex-1">
          <strong className="font-semibold">EMERGENCY NOTICE:</strong> MEDICONNECT is an on-demand medical service platform and <span className="underline font-semibold">not</span> an emergency dispatch service. For life-threatening emergencies, call{' '}
          <a href="tel:999" className="font-bold underline hover:text-red-100 inline-flex items-center gap-1">
            <Phone className="w-3 h-3" /> 999
          </a>{' '}
          or your local emergency response immediately.
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="text-red-200 hover:text-white p-1 rounded-md transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default EmergencyBanner;
