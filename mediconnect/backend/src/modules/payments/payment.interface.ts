export type PaymentMethod = 'MPESA' | 'CARD' | 'CASH' | 'MOCK';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface InitiatePaymentParams {
  bookingId: string;
  patientUserId: string;
  amount: number;
  currency: string;
  phoneNumber?: string;
  idempotencyKey: string;
}

export interface PaymentInitiationResult {
  paymentId: string;
  gatewayReference: string;
  status: PaymentStatus;
  instruction?: string;
  data?: Record<string, unknown>;
}

export interface WebhookResult {
  paymentId?: string;
  gatewayReference: string;
  status: PaymentStatus;
  amount: number;
  rawPayload: Record<string, unknown>;
}

export interface IPaymentAdapter {
  initiate(params: InitiatePaymentParams): Promise<PaymentInitiationResult>;
  verifyWebhook(headers: Record<string, unknown>, body: Record<string, unknown>): Promise<WebhookResult>;
  refund(gatewayReference: string, amount: number, reason: string): Promise<{ refundReference: string; status: string }>;
}
