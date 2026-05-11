import { ApiProperty } from "@nestjs/swagger";

export class ItemDTO {
  @ApiProperty({ example: "USD", description: "Currency code (e.g., USD, EUR)" })
  currency: string;

  @ApiProperty({ example: "IPhone", description: "Name of the item" })
  name: string;

  @ApiProperty({ example: 29.99, description: "Amount per item in given currency" })
  amount: number;

  @ApiProperty({ example: 2, description: "Quantity of the item being purchased" })
  quantity: number;
}

export class CreateCheckoutPayloadDTO {
  @ApiProperty({
    type: ItemDTO,
    isArray: true,
    description: "List of items to be included in the checkout",
    example: [
      {
        currency: "USD",
        name: "T-shirt",
        amount: 29.99,
        quantity: 2,
      },
    ],
  })
  items: ItemDTO[];

  discounts: any[];

  metadata: any;
}
