// payment/providers/stripe.strategy.ts
import { Injectable } from "@nestjs/common";
import Stripe from "stripe";
import { PaymentStrategy } from "../payment.interface";
import { ConfigService, ConfigType } from "@nestjs/config";
import appEnvConfig from "src/config/app.env.config";
import { CreateCheckoutPayloadDTO } from "../dto/create.checkout.payload.dto";
import { PaymentEventDispatcher } from "../payment-event.dispacher";

@Injectable()
export class StripeStrategy implements PaymentStrategy {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService<ConfigType<typeof appEnvConfig>>,
    private readonly eventDispatcher: PaymentEventDispatcher
  ) {
    const stripeConfig = this.configService.get("checkout", { infer: true }).stripe;
    this.stripe = new Stripe(stripeConfig.secret, { apiVersion: "2025-07-30.basil" });
  }

  // NEW: Get payment status
  async getPaymentStatus(sessionId: string): Promise<any> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent"],
      });

      return {
        id: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        customer: session.customer,
        paymentIntent: session.payment_intent,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve session: ${error.message}`);
    }
  }

  // NEW: Create refund
  async createRefund(paymentIntentId: string, refundData: { amount?: number; reason?: string }): Promise<any> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: refundData.amount,
        reason: "requested_by_customer",
      });

      return {
        id: refund.id,
        status: refund.status,
        amount: refund.amount,
        currency: refund.currency,
      };
    } catch (error) {
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  async createCheckoutSession(payload: CreateCheckoutPayloadDTO): Promise<any> {
    const lineItems = payload.items.map((item) => ({
      price_data: {
        currency: item.currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.amount,
      },
      quantity: item.quantity,
    }));

    const stripeConfig = this.configService.get("checkout", { infer: true }).stripe;
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      discounts: payload.discounts,
      success_url: `${stripeConfig.successFrontUrl}?session_id={CHECKOUT_SESSION_ID}&order_id=${payload.metadata.orderId}`,
      cancel_url: `${stripeConfig.cancelFrontUrl}?order_id=${payload.metadata.orderId}`,
      metadata: payload.metadata,
    });

    return { url: session.url };
  }

  async handleWebhookEvent(signature: string, payload: Buffer): Promise<any> {
    const stripeConfig = this.configService.get("checkout", { infer: true }).stripe;

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, stripeConfig.webhookSecret);

      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object;
          await this.eventDispatcher.dispatchEvent({
            orderId: session.metadata.orderId,
            type: "payment_success",
            timestamp: new Date(),
            metadata: session,
          });
          break;
        case "checkout.session.expired":
        case "checkout.session.async_payment_failed":
          const failedSession = event.data.object;
          await this.eventDispatcher.dispatchEvent({
            orderId: failedSession.metadata.orderId,
            type: "payment_failure",
            timestamp: new Date(),
            metadata: failedSession,
          });
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error("Webhook error:", error);
      throw new Error("Webhook signature verification failed");
    }
  }
}
