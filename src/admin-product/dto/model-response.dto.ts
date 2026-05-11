// src/models/dto/model-response.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { CategoryEnum } from "../enum/category.enum";
import { ModelEntity } from "../entity/model.entity";

export class ModelResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: CategoryEnum, example: CategoryEnum.MOBILE })
  category: CategoryEnum;

  @ApiProperty({ example: "iPhone 15 Pro" })
  title: string;

  @ApiProperty({ example: 1 })
  brandId: number;

  @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
  createAt: Date;

  @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
  updateAt: Date;
}
