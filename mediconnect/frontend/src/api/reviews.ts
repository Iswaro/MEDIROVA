import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Review } from '../types';

export interface CreateReviewData {
  bookingId: string;
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
}

export const reviewsApi = {
  create: async (data: CreateReviewData): Promise<ApiResponse<Review>> => {
    const response = await apiClient.post<ApiResponse<Review>>('/reviews', data);
    return response.data;
  },

  listByProvider: async (
    providerId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<PaginatedResponse<Review>>(`/reviews/provider/${providerId}`, { params });
    return response.data;
  },

  getByBooking: async (bookingId: string): Promise<ApiResponse<Review | null>> => {
    const response = await apiClient.get<ApiResponse<Review | null>>(`/reviews/booking/${bookingId}`);
    return response.data;
  },
};
