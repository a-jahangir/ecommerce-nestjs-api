// payment/payment-event.dispatcher.ts
import { Injectable } from "@nestjs/common";
import { PaymentEvent, PaymentEventHandler } from "./payment.event.interfact";

@Injectable()
export class PaymentEventDispatcher {
  private handlers: PaymentEventHandler[] = [];

  registerHandler(handler: PaymentEventHandler): void {
    this.handlers.push(handler);
  }

  async dispatchEvent(event: PaymentEvent): Promise<void> {
    for (const handler of this.handlers) {
      try {
        if (event.type === "payment_success") {
          await handler.handlePaymentSuccess(+event.orderId);
        } else if (event.type === "payment_failure") {
          await handler.handlePaymentFailure(+event.orderId);
        }
      } catch (error) {
        console.error(`Error in payment event handler: ${error.message}`);
        // Continue to other handlers even if one fails
      }
    }
  }
}
