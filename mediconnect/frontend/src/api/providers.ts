import apiClient from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  ProviderProfile,
  WeeklyAvailability,
  EarningEntry,
  EarningsSummary,
  Credential,
  ProviderSearchParams,
  Booking,
} from '../types';

export const providersApi = {
  search: async (params?: ProviderSearchParams): Promise<PaginatedResponse<ProviderProfile>> => {
    const response = await apiClient.get<PaginatedResponse<ProviderProfile>>('/providers', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<ProviderProfile>> => {
    const response = await apiClient.get<ApiResponse<ProviderProfile>>(`/providers/${id}`);
    return response.data;
  },

  getMyProfile: async (): Promise<ApiResponse<ProviderProfile>> => {
    const response = await apiClient.get<ApiResponse<ProviderProfile>>('/providers/me');
    return response.data;
  },

  createProfile: async (data: Partial<ProviderProfile>): Promise<ApiResponse<ProviderProfile>> => {
    const response = await apiClient.post<ApiResponse<ProviderProfile>>('/providers/profile', data);
    return response.data;
  },

  updateProfile: async (data: Partial<ProviderProfile>): Promise<ApiResponse<ProviderProfile>> => {
    const response = await apiClient.patch<ApiResponse<ProviderProfile>>('/providers/profile', data);
    return response.data;
  },

  submitCredentials: async (credentials: Partial<Credential>[]): Promise<ApiResponse<Credential[]>> => {
    const response = await apiClient.post<ApiResponse<Credential[]>>('/providers/credentials', { credentials });
    return response.data;
  },

  uploadCredentialDocument: async (credentialId: string, file: File): Promise<ApiResponse<{ documentUrl: string }>> => {
    const formData = new FormData();
    formData.append('document', file);
    const response = await apiClient.post<ApiResponse<{ documentUrl: string }>>(
      `/providers/credentials/${credentialId}/document`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  updateAvailability: async (availability: WeeklyAvailability): Promise<ApiResponse<ProviderProfile>> => {
    const response = await apiClient.patch<ApiResponse<ProviderProfile>>('/providers/availability', { availability });
    return response.data;
  },

  updateLocation: async (latitude: number, longitude: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.patch<ApiResponse<null>>('/providers/location', { latitude, longitude });
    return response.data;
  },

  toggleAvailability: async (isAvailable: boolean): Promise<ApiResponse<ProviderProfile>> => {
    const response = await apiClient.patch<ApiResponse<ProviderProfile>>('/providers/availability/toggle', { isAvailable });
    return response.data;
  },

  getEarnings: async (params?: { start?: string; end?: string; page?: number; limit?: number }): Promise<PaginatedResponse<EarningEntry>> => {
    const response = await apiClient.get<PaginatedResponse<EarningEntry>>('/providers/earnings', { params });
    return response.data;
  },

  getEarningsSummary: async (params?: { start?: string; end?: string }): Promise<ApiResponse<EarningsSummary>> => {
    const response = await apiClient.get<ApiResponse<EarningsSummary>>('/providers/earnings/summary', { params });
    return response.data;
  },

  getBookings: async (params?: { status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get<PaginatedResponse<Booking>>('/providers/bookings', { params });
    return response.data;
  },

  getCredentials: async (): Promise<ApiResponse<Credential[]>> => {
    const response = await apiClient.get<ApiResponse<Credential[]>>('/providers/credentials');
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>('/providers/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
