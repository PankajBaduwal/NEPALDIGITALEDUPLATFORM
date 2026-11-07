export interface InitiatePaymentParams {
  invoiceId: string;
  amountNpr: number;
  paymentReference: string;
  institutionName: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl?: string;
}

export interface InitiatePaymentResult {
  gateway: 'KHALTI' | 'ESEWA' | 'CONNECT_IPS' | 'BANK_TRANSFER' | 'MANUAL';
  paymentReference: string;
  paymentUrl?: string; // Redirect URL to complete gateway payment
  pidx?: string; // Gateway transaction token (e.g. Khalti pidx)
  additionalData?: Record<string, any>;
}

export interface VerifyPaymentParams {
  paymentReference: string;
  gatewayTransactionId?: string;
  pidx?: string;
  token?: string;
  amountNpr?: number;
  callbackPayload?: any;
}

export interface VerifyPaymentResult {
  isSuccess: boolean;
  gatewayTransactionId: string;
  amountPaidNpr: number;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  verifiedAt: Date;
  rawResponse?: any;
}

export interface IPaymentGateway {
  readonly gatewayType: 'KHALTI' | 'ESEWA' | 'CONNECT_IPS' | 'BANK_TRANSFER' | 'MANUAL';
  initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;
}

