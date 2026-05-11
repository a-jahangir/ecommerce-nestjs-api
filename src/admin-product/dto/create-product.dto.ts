import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsNotEmpty, IsNumber, IsArray, IsBoolean } from "class-validator";
import { CategoryEnum } from "../enum/category.enum";
import { ProductImageDto } from "./product-image.dto";

export class CreateProductDto {
  @ApiProperty({ enum: CategoryEnum, example: CategoryEnum.MOBILE })
  @IsEnum(CategoryEnum)
  category?: CategoryEnum;

  @ApiPropertyOptional({ type: Date, example: "2023-01-01" })
  @IsOptional()
  releaseDate?: Date;

  @ApiProperty({ example: "iPhone 15 Pro Max" })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: "Latest flagship smartphone from Apple" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: "Buy iPhone 15 Pro Max - Best Smartphone" })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional({ example: "Shop the latest iPhone 15 Pro Max" })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @ApiPropertyOptional()
  brandId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  modelId: number;

  @ApiPropertyOptional({ example: true, default: false })
  @IsBoolean()
  @IsOptional()
  visibleOnStore?: boolean = false;

  @ApiPropertyOptional({ example: true, default: false })
  @IsBoolean()
  @IsOptional()
  recommended?: boolean = false;

  @ApiProperty()
  files: ProductImageDto[];
}
