export interface PaymentStrategy {
  createCheckoutSession(payload: any): Promise<any>;
  handleWebhookEvent(signature: string, payload: Buffer): Promise<any>;
}
