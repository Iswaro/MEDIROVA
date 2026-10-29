// ─── Enums ────────────────────────────────────────────────────────────────────

export enum UserRole {
  PATIENT = 'PATIENT',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED_BY_PATIENT = 'CANCELLED_BY_PATIENT',
  CANCELLED_BY_PROVIDER = 'CANCELLED_BY_PROVIDER',
  EXPIRED = 'EXPIRED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentMethod {
  MPESA = 'MPESA',
  CARD = 'CARD',
  CASH = 'CASH',
  MOCK = 'MOCK',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum ProviderType {
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  LABORATORY = 'LABORATORY',
  PHARMACY = 'PHARMACY',
  AMBULANCE = 'AMBULANCE',
  PHYSIOTHERAPIST = 'PHYSIOTHERAPIST',
  HOME_CARE = 'HOME_CARE',
  OTHER = 'OTHER',
}

// ─── Core User Models ─────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  county: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface PatientProfile {
  id: string;
  userId: string;
  user: User;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  bloodGroup?: string;
  allergies?: string[];
  medicalHistory?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  user: User;
  providerType: ProviderType;
  licenseNumber?: string;
  specializations: string[];
  bio?: string;
  yearsOfExperience: number;
  languages: string[];
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
  serviceArea?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  services: ProviderService[];
  availability: WeeklyAvailability;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyAvailability {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  isAvailable: boolean;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  breakStart?: string;
  breakEnd?: string;
}

// ─── Service Models ───────────────────────────────────────────────────────────

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  providerCount: number;
  createdAt: string;
}

export interface ProviderService {
  id: string;
  providerId: string;
  categoryId: string;
  category?: ServiceCategory;
  name: string;
  description?: string;
  basePrice: number;
  currency: string;
  durationMinutes: number;
  isActive: boolean;
}

// ─── Booking Models ───────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  bookingNumber: string;
  patientId: string;
  patient?: PatientProfile;
  providerId: string;
  provider?: ProviderProfile;
  serviceId: string;
  service?: ProviderService;
  status: BookingStatus;
  scheduledAt?: string;
  isImmediate: boolean;
  serviceAddress: Address;
  notes?: string;
  quotedPrice: number;
  finalPrice?: number;
  currency: string;
  payment?: Payment;
  statusHistory: BookingStatusHistory[];
  cancellationReason?: string;
  cancelledBy?: string;
  rating?: Review;
  estimatedArrivalMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  status: BookingStatus;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedBy: string;
}

// ─── Payment Models ───────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  bookingId: string;
  booking?: Booking;
  patientId: string;
  providerId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  mpesaPhone?: string;
  mpesaReceiptNumber?: string;
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
  paidAt?: string;
  refundedAt?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Review Models ────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  bookingId: string;
  patientId: string;
  patient?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  providerId: string;
  rating: number;
  comment?: string;
  isAnonymous: boolean;
  createdAt: string;
}

// ─── Notification Models ──────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// ─── Support Models ───────────────────────────────────────────────────────────

export interface SupportTicket {
  id: string;
  userId: string;
  user?: User;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Credential Models ────────────────────────────────────────────────────────

export interface Credential {
  id: string;
  providerId: string;
  type: string;
  title: string;
  issuingBody: string;
  issuedAt: string;
  expiresAt?: string;
  documentUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

// ─── Earnings Models ──────────────────────────────────────────────────────────

export interface EarningEntry {
  id: string;
  providerId: string;
  bookingId: string;
  booking?: Pick<Booking, 'id' | 'bookingNumber' | 'createdAt'>;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  totalPlatformFees: number;
  netEarnings: number;
  pendingPayout: number;
  currency: string;
  period: {
    start: string;
    end: string;
  };
}

// ─── Admin Models ─────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  userId?: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  totalPatients: number;
  totalProviders: number;
  pendingVerifications: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  todayBookings: number;
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  recentActivity: AuditLog[];
}

export interface PlatformSetting {
  key: string;
  value: string;
  description?: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  isPublic: boolean;
  updatedAt: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  message?: string;
}

// ─── Auth Models ──────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPatientData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole.PATIENT;
}

export interface RegisterProviderData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole.PROVIDER;
  providerType: ProviderType;
}

export type RegisterData = RegisterPatientData | RegisterProviderData;

// ─── Search / Filter Models ───────────────────────────────────────────────────

export interface ProviderSearchParams {
  categoryId?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  providerType?: ProviderType;
  minRating?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface BookingListParams {
  status?: BookingStatus;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

// ─── Socket Event Types ───────────────────────────────────────────────────────

export interface BookingStatusEvent {
  bookingId: string;
  status: BookingStatus;
  timestamp: string;
  location?: { latitude: number; longitude: number };
  notes?: string;
  estimatedArrivalMinutes?: number;
}

export interface ProviderLocationEvent {
  providerId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface NotificationEvent {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}
