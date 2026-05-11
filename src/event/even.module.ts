// events/events.module.ts
import { Module } from "@nestjs/common";
import { PaymentEventDispatcher } from "../payment/payment-event.dispacher";

@Module({
  providers: [PaymentEventDispatcher],
  exports: [PaymentEventDispatcher],
})
export class EventsModule {}
