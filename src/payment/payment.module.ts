// payment/payment.module.ts
import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { StripeStrategy } from "./providers/stripe.strategy";
import { EventsModule } from "../event/even.module";

@Module({
  imports: [EventsModule],
  controllers: [PaymentController],
  providers: [PaymentService, StripeStrategy],
  exports: [PaymentService],
})
export class PaymentModule {}
