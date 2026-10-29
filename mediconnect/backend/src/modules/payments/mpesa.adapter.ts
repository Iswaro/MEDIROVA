import axios from 'axios';
import { config } from '../../config/env';
import { IPaymentAdapter, InitiatePaymentParams, PaymentInitiationResult, WebhookResult } from './payment.interface';
import { AppError } from '../../middleware/errorHandler';

export class MpesaDarajaAdapter implements IPaymentAdapter {
  private baseURL: string;

  constructor() {
    this.baseURL = 'https://sandbox.safaricom.co.ke';
  }

  private async getAccessToken(): Promise<string> {
    if (!config.MPESA_CONSUMER_KEY || !config.MPESA_CONSUMER_SECRET) {
      throw new AppError('M-Pesa API credentials are not configured', 500);
    }

    const auth = Buffer.from(`${config.MPESA_CONSUMER_KEY}:${config.MPESA_CONSUMER_SECRET}`).toString('base64');
    try {
      const response = await axios.get(
        `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: { Authorization: `Basic ${auth}` },
        },
      );
      return response.data.access_token;
    } catch {
      throw new AppError('Failed to authenticate with M-Pesa Daraja API', 502);
    }
  }

  async initiate(params: InitiatePaymentParams): Promise<PaymentInitiationResult> {
    if (!params.phoneNumber) {
      throw new AppError('Phone number required for M-Pesa STK Push', 400);
    }

    // Format phone to 2547XXXXXXXX
    let phone = params.phoneNumber.replace(/\+/g, '').replace(/\s/g, '');
    if (phone.startsWith('0')) {
      phone = '254' + phone.substring(1);
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);

    const shortcode = config.MPESA_SHORTCODE || '174379';
    const passkey = config.MPESA_PASSKEY || '';
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.round(params.amount),
          PartyA: phone,
          PartyB: shortcode,
          PhoneNumber: phone,
          CallBackURL: config.MPESA_CALLBACK_URL || 'https://example.com/api/v1/payments/webhook',
          AccountReference: `MED-${params.bookingId.substring(0, 8)}`,
          TransactionDesc: 'Mediconnect Healthcare Service',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return {
        paymentId: params.bookingId,
        gatewayReference: response.data.CheckoutRequestID,
        status: 'PROCESSING',
        instruction: 'Please enter your M-Pesa PIN on your phone to complete payment.',
        data: response.data,
      };
    } catch (err: unknown) {
      const errorData = axios.isAxiosError(err) ? err.response?.data : null;
      throw new AppError(
        `M-Pesa STK Push failed: ${errorData?.errorMessage || 'Unable to process'}`,
        502,
      );
    }
  }

  async verifyWebhook(_headers: Record<string, unknown>, body: Record<string, unknown>): Promise<WebhookResult> {
    const stkCallback = (body as { Body?: { stkCallback?: Record<string, unknown> } })?.Body?.stkCallback;
    if (!stkCallback) {
      throw new AppError('Invalid M-Pesa callback payload', 400);
    }

    const checkoutRequestId = String(stkCallback.CheckoutRequestID || '');
    const resultCode = Number(stkCallback.ResultCode);
    const isSuccess = resultCode === 0;

    let amount = 0;
    if (isSuccess && Array.isArray((stkCallback.CallbackMetadata as { Item?: Array<{ Name: string; Value: unknown }> })?.Item)) {
      const amountItem = (stkCallback.CallbackMetadata as { Item: Array<{ Name: string; Value: unknown }> }).Item.find(
        i => i.Name === 'Amount',
      );
      if (amountItem) amount = Number(amountItem.Value);
    }

    return {
      gatewayReference: checkoutRequestId,
      status: isSuccess ? 'COMPLETED' : 'FAILED',
      amount,
      rawPayload: body,
    };
  }

  async refund(_gatewayReference: string, _amount: number, _reason: string): Promise<{ refundReference: string; status: string }> {
    return {
      refundReference: `MPESA-REV-${Date.now()}`,
      status: 'PENDING',
    };
  }
}
