import { OrderResponseDto } from "src/user-order/dto/order-response.dto";

export class AdminOrderResponseDto extends OrderResponseDto {
  adminNotes?: string;
  internalStatus?: string;
  costPrice?: number;
  profit?: number;
}
