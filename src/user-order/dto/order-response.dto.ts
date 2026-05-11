// order-response.dto.ts
export class OrderItemResponseDto {
  productId: string;
  productName: string;
  productImage?: string;
  variantId: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export class OrderResponseDto {
  orderId: number;
  createdAt: Date;
  orderStatus: string;
  buyerProfile: {
    userId: string;
    name: string;
    email: string;
    phone?: string;
  };
  paymentId: string;
  paymentStatus: string;
  productData: OrderItemResponseDto[];
  selectedVariantData: any; // Can be merged into productData
  totalAmount: number;
  shippingAddress?: string;
}
