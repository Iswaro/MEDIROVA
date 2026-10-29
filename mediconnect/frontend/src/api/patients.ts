import apiClient from './client';
import type { ApiResponse, PaginatedResponse, PatientProfile, Address, Booking, BookingListParams } from '../types';

export const patientsApi = {
  getProfile: async (): Promise<ApiResponse<PatientProfile>> => {
    const response = await apiClient.get<ApiResponse<PatientProfile>>('/patients/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<PatientProfile>): Promise<ApiResponse<PatientProfile>> => {
    const response = await apiClient.patch<ApiResponse<PatientProfile>>('/patients/profile', data);
    return response.data;
  },

  getBookings: async (params?: BookingListParams): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get<PaginatedResponse<Booking>>('/patients/bookings', { params });
    return response.data;
  },

  getAddresses: async (): Promise<ApiResponse<Address[]>> => {
    const response = await apiClient.get<ApiResponse<Address[]>>('/patients/addresses');
    return response.data;
  },

  addAddress: async (address: Omit<Address, 'id'>): Promise<ApiResponse<Address>> => {
    const response = await apiClient.post<ApiResponse<Address>>('/patients/addresses', address);
    return response.data;
  },

  updateAddress: async (id: string, data: Partial<Address>): Promise<ApiResponse<Address>> => {
    const response = await apiClient.patch<ApiResponse<Address>>(`/patients/addresses/${id}`, data);
    return response.data;
  },

  deleteAddress: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/patients/addresses/${id}`);
    return response.data;
  },

  setDefaultAddress: async (id: string): Promise<ApiResponse<Address>> => {
    const response = await apiClient.patch<ApiResponse<Address>>(`/patients/addresses/${id}/default`);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>('/patients/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
