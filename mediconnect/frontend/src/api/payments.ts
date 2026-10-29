import apiClient from './client';
import type { ApiResponse, Payment, PaymentMethod } from '../types';

export interface InitiatePaymentData {
  bookingId: string;
  method: PaymentMethod;
  mpesaPhone?: string;
}

export const paymentsApi = {
  initiate: async (data: InitiatePaymentData): Promise<ApiResponse<Payment>> => {
    const response = await apiClient.post<ApiResponse<Payment>>('/payments', data);
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Payment>> => {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data;
  },

  getByBookingId: async (bookingId: string): Promise<ApiResponse<Payment>> => {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/booking/${bookingId}`);
    return response.data;
  },

  refund: async (id: string, reason: string): Promise<ApiResponse<Payment>> => {
    const response = await apiClient.post<ApiResponse<Payment>>(`/payments/${id}/refund`, { reason });
    return response.data;
  },

  checkStatus: async (id: string): Promise<ApiResponse<Payment>> => {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}/status`);
    return response.data;
  },
};
