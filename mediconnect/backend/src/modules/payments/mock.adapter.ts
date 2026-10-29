import { v4 as uuidv4 } from 'uuid';
import { IPaymentAdapter, InitiatePaymentParams, PaymentInitiationResult, WebhookResult } from './payment.interface';

export class MockPaymentAdapter implements IPaymentAdapter {
  async initiate(params: InitiatePaymentParams): Promise<PaymentInitiationResult> {
    const gatewayReference = `MOCK-TXN-${uuidv4().substring(0, 8).toUpperCase()}`;
    return {
      paymentId: uuidv4(),
      gatewayReference,
      status: 'COMPLETED',
      instruction: 'Sandbox payment processed immediately via Mock Adapter.',
      data: {
        mockProcessedAt: new Date().toISOString(),
        phoneNumber: params.phoneNumber ?? '254700000000',
        amount: params.amount,
      },
    };
  }

  async verifyWebhook(_headers: Record<string, unknown>, body: Record<string, unknown>): Promise<WebhookResult> {
    return {
      gatewayReference: (body.gatewayReference as string) || `MOCK-${uuidv4()}`,
      status: (body.status as 'COMPLETED' | 'FAILED') || 'COMPLETED',
      amount: Number(body.amount) || 0,
      rawPayload: body,
    };
  }

  async refund(gatewayReference: string, amount: number, _reason: string): Promise<{ refundReference: string; status: string }> {
    return {
      refundReference: `MOCK-REFUND-${uuidv4().substring(0, 8).toUpperCase()}`,
      status: 'PROCESSED',
    };
  }
}
