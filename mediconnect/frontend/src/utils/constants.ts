import { BookingStatus } from '../types';

export const BOOKING_STATUSES = Object.values(BookingStatus);

export const SERVICE_CATEGORY_ICONS: Record<string, string> = {
  'doctor-home-visit': '🩺',
  'nurse-home-visit': '💉',
  'telemedicine': '📹',
  'lab-sample-collection': '🧪',
  'pharmacy-delivery': '💊',
  'ambulance': '🚑',
  'physiotherapy': '🦴',
  'home-care': '🏠',
};

export const ROLES = {
  PATIENT: 'PATIENT',
  PROVIDER: 'PROVIDER',
  ADMIN: 'ADMIN',
  SUPPORT: 'SUPPORT',
} as const;

export const NAIROBI_CENTER = {
  latitude: -1.2921,
  longitude: 36.8219,
};

export const DEFAULT_SEARCH_RADIUS_KM = 20;

export const EMERGENCY_NUMBERS = {
  kenya_emergency: '999',
  kenya_police: '112',
  kenya_ambulance: '0800 723 253',
};

export const PLATFORM_NAME = 'MediConnect';
export const PLATFORM_TAGLINE = 'Healthcare at Your Doorstep';
export const CURRENCY = 'KES';
export const COUNTRY = 'Kenya';

export const MAX_FILE_SIZE_MB = 5;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
