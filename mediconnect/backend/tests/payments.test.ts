import { MockPaymentAdapter } from '../src/modules/payments/mock.adapter';
import { v4 as uuidv4 } from 'uuid';

describe('Payment Adapter (Mock Sandbox)', () => {
  const adapter = new MockPaymentAdapter();

  it('initiates mock payment and returns COMPLETED status', async () => {
    const result = await adapter.initiate({
      bookingId: uuidv4(),
      patientUserId: uuidv4(),
      amount: 3500.0,
      currency: 'KES',
      phoneNumber: '254712345678',
      idempotencyKey: uuidv4(),
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.gatewayReference).toMatch(/^MOCK-TXN-/);
  });

  it('verifies mock webhook successfully', async () => {
    const webhookData = {
      gatewayReference: 'MOCK-TXN-123456',
      status: 'COMPLETED',
      amount: 3500,
    };

    const verified = await adapter.verifyWebhook({}, webhookData);
    expect(verified.status).toBe('COMPLETED');
    expect(verified.amount).toBe(3500);
  });

  it('processes refund and returns PROCESSED status', async () => {
    const refund = await adapter.refund('MOCK-TXN-123456', 3500, 'Customer cancelled');
    expect(refund.status).toBe('PROCESSED');
    expect(refund.refundReference).toMatch(/^MOCK-REFUND-/);
  });
});
