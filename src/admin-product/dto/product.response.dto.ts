// src/products/dto/product-response.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { CategoryEnum } from "../enum/category.enum";
import { BrandResponseDto } from "./brand-response.dto";
import { ModelResponseDto } from "./model-response.dto";
import { SpecificationResponseDto } from "./specification.response.dto";
import { TagResponseDto } from "./tag.response.dto";
import { ProductImageEntity } from "../entity/product.images.entity";

export class ProductResponseDto {
  @ApiProperty({ example: 1, description: "Product ID" })
  id: number;

  @ApiProperty({ enum: CategoryEnum, example: CategoryEnum.MOBILE })
  category: CategoryEnum;

  @ApiProperty({ example: "2023-01-01", nullable: true })
  releaseDate?: Date;

  @ApiProperty({ example: "iPhone 15 Pro" })
  name: string;

  @ApiProperty({ example: "Latest flagship smartphone", nullable: true })
  description?: string;

  @ApiProperty({ example: "Buy iPhone 15 Pro", nullable: true })
  metaTitle?: string;

  @ApiProperty({ example: "Best smartphone in 2023", nullable: true })
  metaDescription?: string;

  @ApiProperty({ type: BrandResponseDto })
  brand: BrandResponseDto;

  @ApiProperty({ type: ModelResponseDto })
  model: ModelResponseDto;

  @ApiProperty({ type: [SpecificationResponseDto] })
  specifications: SpecificationResponseDto[];

  @ApiProperty({ type: [TagResponseDto] })
  tags: TagResponseDto[];

  @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
  createAt: Date;

  @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
  updateAt: Date;

  visibleOnStore: boolean;

  recommended: boolean;

  images?: ProductImageEntity[];
}
