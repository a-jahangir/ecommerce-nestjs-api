export interface PaymentEvent {
  orderId: string;
  type: "payment_success" | "payment_failure";
  timestamp: Date;
  metadata?: any;
}

export interface PaymentEventHandler {
  handlePaymentSuccess(orderId: number): Promise<void>;
  handlePaymentFailure(orderId: number): Promise<void>;
}
