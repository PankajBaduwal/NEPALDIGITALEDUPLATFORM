import {
  IPaymentGateway,
  InitiatePaymentParams,
  InitiatePaymentResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
} from './payment-gateway.interface';

/**
 * Manual / Bank Transfer Gateway
 * Generates bank deposit details (e.g., Rastriya Banijya Bank / Nabil Bank Nepal)
 * and allows Super Admin / School Accountant to verify deposit slip vouchers.
 */
export class ManualBankGateway implements IPaymentGateway {
  readonly gatewayType = 'BANK_TRANSFER';

  async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    return {
      gateway: this.gatewayType,
      paymentReference: params.paymentReference,
      additionalData: {
        bankName: 'Nabil Bank Ltd, Kathmandu Main Branch',
        accountName: 'Nepal Digital Education Ecosystem Pvt. Ltd.',
        accountNumber: '00100175001234',
        swiftCode: 'NARBNPKT',
        depositInstructions:
          'Please mention the Payment Reference in the deposit voucher remarks and submit the voucher copy via the Institution Admin Portal.',
      },
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    return {
      isSuccess: true,
      gatewayTransactionId: params.gatewayTransactionId || `BANK_VOUCHER_${Date.now()}`,
      amountPaidNpr: params.amountNpr || 0,
      status: 'COMPLETED',
      verifiedAt: new Date(),
      rawResponse: {
        method: 'BANK_TRANSFER',
        verifiedManually: true,
      },
    };
  }
}

