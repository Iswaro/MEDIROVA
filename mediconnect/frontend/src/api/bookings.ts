import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Booking, BookingStatus, Address, BookingListParams } from '../types';

export interface CreateBookingData {
  providerId: string;
  serviceId: string;
  serviceAddress: Omit<Address, 'id' | 'isDefault'>;
  scheduledAt?: string;
  isImmediate: boolean;
  notes?: string;
}

export const bookingsApi = {
  create: async (data: CreateBookingData): Promise<ApiResponse<Booking>> => {
    const response = await apiClient.post<ApiResponse<Booking>>('/bookings', data);
    return response.data;
  },

  list: async (params?: BookingListParams): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get<PaginatedResponse<Booking>>('/bookings', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Booking>> => {
    const response = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data;
  },

  accept: async (id: string): Promise<ApiResponse<Booking>> => {
    const response = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/accept`);
    return response.data;
  },

  reject: async (id: string, reason?: string): Promise<ApiResponse<Booking>> => {
    const response = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/reject`, { reason });
    return response.data;
  },

  cancel: async (id: string, reason: string): Promise<ApiResponse<Booking>> => {
    const response = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  updateStatus: async (
    id: string,
    status: BookingStatus,
    notes?: string,
    location?: { latitude: number; longitude: number }
  ): Promise<ApiResponse<Booking>> => {
    const response = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, {
      status,
      notes,
      location,
    });
    return response.data;
  },

  complete: async (id: string, finalPrice?: number): Promise<ApiResponse<Booking>> => {
    const response = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/complete`, { finalPrice });
    return response.data;
  },

  getQuote: async (providerId: string, serviceId: string, addressId?: string): Promise<ApiResponse<{ quotedPrice: number; currency: string }>> => {
    const response = await apiClient.post<ApiResponse<{ quotedPrice: number; currency: string }>>('/bookings/quote', {
      providerId,
      serviceId,
      addressId,
    });
    return response.data;
  },
};
