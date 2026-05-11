import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, IsArray } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateOrderDetailDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: "Variant ID of the product",
    example: 123,
  })
  variant_id: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: "Product ID",
    example: 456,
  })
  product_id: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: "Quantity of the product",
    example: 2,
  })
  quantity: number;
}

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: "Total price of the order",
    example: 99.99,
  })
  price: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "Discount code applied to the order",
    example: "SUMMER2023",
  })
  discount?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDto)
  @ApiProperty({
    description: "Order details containing product information",
    type: [CreateOrderDetailDto],
    example: [
      {
        variant_id: 123,
        product_id: 456,
        quantity: 2,
      },
      {
        variant_id: 789,
        product_id: 101,
        quantity: 1,
      },
    ],
  })
  details: CreateOrderDetailDto[];
}
