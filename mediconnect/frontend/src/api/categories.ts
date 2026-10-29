import apiClient from './client';
import type { ApiResponse, PaginatedResponse, ServiceCategory } from '../types';

export const categoriesApi = {
  list: async (): Promise<PaginatedResponse<ServiceCategory>> => {
    const response = await apiClient.get<PaginatedResponse<ServiceCategory>>('/categories');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<ServiceCategory>> => {
    const response = await apiClient.get<ApiResponse<ServiceCategory>>(`/categories/${id}`);
    return response.data;
  },
};
