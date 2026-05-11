// payment/payment.service.ts
import { Injectable } from "@nestjs/common";
import { PaymentStrategy } from "./payment.interface";
import { StripeStrategy } from "./providers/stripe.strategy";
import { CreateCheckoutPayloadDTO } from "./dto/create.checkout.payload.dto";

@Injectable()
export class PaymentService {
  private providers: Map<string, PaymentStrategy>;

  constructor(private readonly stripeStrategy: StripeStrategy) {
    this.providers = new Map<string, PaymentStrategy>([["stripe", this.stripeStrategy]]);
  }

  getProvider(provider: string): PaymentStrategy {
    const strategy = this.providers.get(provider);
    if (!strategy) {
      throw new Error(`Payment provider ${provider} not found`);
    }
    return strategy;
  }

  async createCheckoutSession(provider: string, payload: CreateCheckoutPayloadDTO) {
    const strategy = this.getProvider(provider);
    return await strategy.createCheckoutSession(payload);
  }

  async handleWebhookEvent(provider: string, signature: string, payload: Buffer) {
    const strategy = this.getProvider(provider);
    return await strategy.handleWebhookEvent(signature, payload);
  }

  // NEW: Get payment status
  async getPaymentStatus(provider: string, sessionId: string) {
    const strategy = this.getProvider(provider);

    if (typeof (strategy as any).getPaymentStatus === "function") {
      return await (strategy as any).getPaymentStatus(sessionId);
    }

    throw new Error(`Provider ${provider} does not support getPaymentStatus`);
  }

  // NEW: Create refund
  async createRefund(provider: string, paymentIntentId: string, refundData: any) {
    const strategy = this.getProvider(provider);

    if (typeof (strategy as any).createRefund === "function") {
      return await (strategy as any).createRefund(paymentIntentId, refundData);
    }

    throw new Error(`Provider ${provider} does not support createRefund`);
  }
}
