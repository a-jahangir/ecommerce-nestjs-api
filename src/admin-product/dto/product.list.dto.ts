import { ApiProperty } from "@nestjs/swagger";
import { CategoryEnum } from "../enum/category.enum";
import { BrandResponseDto } from "./brand-response.dto";
import { ModelResponseDto } from "./model-response.dto";

export class ProductListDto {
  @ApiProperty({ example: 1, description: "Product ID" })
  id: number;

  quantity: number;

  price: string;

  visibleOnStore: boolean;

  recommended: boolean;

  @ApiProperty({ enum: CategoryEnum, example: CategoryEnum.MOBILE })
  category: CategoryEnum;

  @ApiProperty({ type: BrandResponseDto })
  brand: BrandResponseDto;

  @ApiProperty({ example: "iPhone 15 Pro" })
  name: string;

  @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
  createAt: Date;

  @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
  updateAt: Date;

  @ApiProperty({ type: ModelResponseDto })
  model: ModelResponseDto;
}
