// payment.controller.ts - Add validation and more endpoints
import { Body, Controller, Post, Param, Headers, Get, UsePipes, ValidationPipe } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { CreateCheckoutPayloadDTO } from "./dto/create.checkout.payload.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller("api/v1/payment")
@ApiTags("Payment")
@UsePipes(new ValidationPipe({ transform: true }))
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(":provider/checkout")
  @ApiOperation({ summary: "Create checkout session" })
  @ApiResponse({ status: 201, description: "Checkout session created successfully" })
  async checkout(@Param("provider") provider: string, @Body() body: CreateCheckoutPayloadDTO) {
    return {
      data: await this.paymentService.createCheckoutSession(provider, body),
    };
  }

  @Post(":provider/webhook")
  @ApiOperation({ summary: "Handle payment webhook" })
  @ApiResponse({ status: 200, description: "Webhook processed successfully" })
  async handleWebhook(
    @Param("provider") provider: string,
    @Headers("stripe-signature") signature: string,
    @Body() payload: Buffer
  ) {
    return await this.paymentService.handleWebhookEvent(provider, signature, payload);
  }

  // NEW: Get payment session status
  @Get(":provider/session/:sessionId")
  @ApiOperation({ summary: "Get payment session status" })
  async getPaymentStatus(@Param("provider") provider: string, @Param("sessionId") sessionId: string) {
    return {
      data: await this.paymentService.getPaymentStatus(provider, sessionId),
    };
  }
}
