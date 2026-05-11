// src/products/dto/variant-response.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { ProductVariantEntity } from "../entity/product.variant.entity";
import { ConditionEnum } from "../enum/condition.enum";
import { StorageEnum } from "../enum/storage.enum";

export class VariantResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: StorageEnum, example: StorageEnum.GB_256 })
  storage: StorageEnum;

  @ApiProperty({ enum: ConditionEnum, example: ConditionEnum.GOOD })
  condition: ConditionEnum;

  @ApiProperty({ example: "iphone-15-pro.png", nullable: true })
  filePath?: string;

  @ApiProperty({ example: "iPhone 15 Pro Image", nullable: true })
  altText?: string;

  @ApiProperty({ example: "IP15P-256-GD" })
  SKU: string;

  @ApiProperty({ example: 100 })
  quantity: number;

  @ApiProperty({ example: 999.99 })
  basePrice: number;

  @ApiProperty({ example: 1099.99, nullable: true })
  brandNewPrice?: number;

  @ApiProperty({ example: 10.5, nullable: true })
  discount?: number;

  @ApiProperty({ example: true })
  primary: boolean;
}
