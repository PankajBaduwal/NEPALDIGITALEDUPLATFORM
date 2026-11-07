import { IPaymentGateway } from './payment-gateway.interface';
import { KhaltiPaymentGateway } from './khalti.gateway';
import { EsewaPaymentGateway } from './esewa.gateway';
import { ManualBankGateway } from './manual.gateway';

export class PaymentGatewayFactory {
  private static instances: Map<string, IPaymentGateway> = new Map();

  static getGateway(gatewayType: 'KHALTI' | 'ESEWA' | 'CONNECT_IPS' | 'BANK_TRANSFER' | 'MANUAL'): IPaymentGateway {
    const key = gatewayType.toUpperCase();

    if (!this.instances.has(key)) {
      switch (key) {
        case 'KHALTI':
          this.instances.set(key, new KhaltiPaymentGateway());
          break;
        case 'ESEWA':
          this.instances.set(key, new EsewaPaymentGateway());
          break;
        case 'BANK_TRANSFER':
        case 'MANUAL':
        case 'CONNECT_IPS':
        default:
          this.instances.set(key, new ManualBankGateway());
          break;
      }
    }

    return this.instances.get(key)!;
  }
}

export * from './payment-gateway.interface';
export * from './khalti.gateway';
export * from './esewa.gateway';
export * from './manual.gateway';

