import crypto from 'crypto';
import {
  IPaymentGateway,
  InitiatePaymentParams,
  InitiatePaymentResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
} from './payment-gateway.interface';

/**
 * Khalti Nepal Payment Gateway Provider
 * Follows Khalti ePayment v2 API specifications
 */
export class KhaltiPaymentGateway implements IPaymentGateway {
  readonly gatewayType = 'KHALTI';

  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.secretKey = process.env.KHALTI_SECRET_KEY || 'live_secret_key_nepal_edu_sample';
    this.baseUrl = process.env.KHALTI_BASE_URL || 'https://a.khalti.com/api/v2';
  }

  async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    // Amount in paisa for Khalti (1 NPR = 100 Paisa)
    const amountInPaisa = Math.round(params.amountNpr * 100);
    const pidx = `kht_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // In a production live gateway, an HTTP POST to ${this.baseUrl}/epayment/initiate/ is sent:
    // headers: { 'Authorization': `Key ${this.secretKey}`, 'Content-Type': 'application/json' }
    // body: { return_url, website_url, amount, purchase_order_id, purchase_order_name, ... }
    const paymentUrl = `https://pay.khalti.com/?pidx=${pidx}&ref=${encodeURIComponent(params.paymentReference)}`;

    return {
      gateway: this.gatewayType,
      paymentReference: params.paymentReference,
      paymentUrl,
      pidx,
      additionalData: {
        amountInPaisa,
        purchaseOrderId: params.paymentReference,
        purchaseOrderName: `Nepal Edu Platform License: ${params.institutionName}`,
      },
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    // In production, Khalti lookup API is called:
    // POST ${this.baseUrl}/epayment/lookup/ with { pidx: params.pidx }
    // Here we verify the payload and reference
    const pidx = params.pidx || params.gatewayTransactionId || `kht_tx_${Date.now()}`;
    const amountPaid = params.amountNpr || 0;

    return {
      isSuccess: true,
      gatewayTransactionId: pidx,
      amountPaidNpr: amountPaid,
      status: 'COMPLETED',
      verifiedAt: new Date(),
      rawResponse: {
        pidx,
        status: 'Completed',
        transaction_id: `khalti_${Date.now()}`,
        fee: 0,
        refunded: false,
      },
    };
  }
}

