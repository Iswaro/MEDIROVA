import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Notification } from '../types';

export const notificationsApi = {
  list: async (params?: { page?: number; limit?: number; isRead?: boolean }): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get<PaginatedResponse<Notification>>('/notifications', { params });
    return response.data;
  },

  markRead: async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.patch<ApiResponse<null>>('/notifications/read-all');
    return response.data;
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/notifications/${id}`);
    return response.data;
  },
};
