import apiClient from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  AdminDashboardMetrics,
  User,
  ProviderProfile,
  Booking,
  Payment,
  AuditLog,
  PlatformSetting,
} from '../types';

export const adminApi = {
  getDashboard: async (): Promise<ApiResponse<AdminDashboardMetrics>> => {
    const response = await apiClient.get<ApiResponse<AdminDashboardMetrics>>('/admin/dashboard');
    return response.data;
  },

  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data;
  },

  suspendUser: async (id: string, reason: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/suspend`, { reason });
    return response.data;
  },

  activateUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/activate`);
    return response.data;
  },

  getPendingProviders: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<ProviderProfile>> => {
    const response = await apiClient.get<PaginatedResponse<ProviderProfile>>('/admin/providers/pending', { params });
    return response.data;
  },

  getAllProviders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<ProviderProfile>> => {
    const response = await apiClient.get<PaginatedResponse<ProviderProfile>>('/admin/providers', { params });
    return response.data;
  },

  verifyProvider: async (
    providerId: string,
    action: 'APPROVE' | 'REJECT',
    notes?: string
  ): Promise<ApiResponse<ProviderProfile>> => {
    const response = await apiClient.patch<ApiResponse<ProviderProfile>>(`/admin/providers/${providerId}/verify`, {
      action,
      notes,
    });
    return response.data;
  },

  getBookings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get<PaginatedResponse<Booking>>('/admin/bookings', { params });
    return response.data;
  },

  getPayments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
  }): Promise<PaginatedResponse<Payment>> => {
    const response = await apiClient.get<PaginatedResponse<Payment>>('/admin/payments', { params });
    return response.data;
  },

  refundPayment: async (paymentId: string, reason: string): Promise<ApiResponse<Payment>> => {
    const response = await apiClient.post<ApiResponse<Payment>>(`/admin/payments/${paymentId}/refund`, { reason });
    return response.data;
  },

  getAuditLogs: async (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<AuditLog>> => {
    const response = await apiClient.get<PaginatedResponse<AuditLog>>('/admin/audit-logs', { params });
    return response.data;
  },

  getSettings: async (): Promise<ApiResponse<PlatformSetting[]>> => {
    const response = await apiClient.get<ApiResponse<PlatformSetting[]>>('/admin/settings');
    return response.data;
  },

  updateSetting: async (key: string, value: string): Promise<ApiResponse<PlatformSetting>> => {
    const response = await apiClient.patch<ApiResponse<PlatformSetting>>(`/admin/settings/${key}`, { value });
    return response.data;
  },

  getReports: async (type: string, params?: Record<string, string>): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get<ApiResponse<unknown>>(`/admin/reports/${type}`, { params });
    return response.data;
  },
};
