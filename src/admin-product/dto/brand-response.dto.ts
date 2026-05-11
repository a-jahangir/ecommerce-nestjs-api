// src/brands/dto/brand-response.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { ModelResponseDto } from "./model-response.dto";
import { ModelEntity } from "../entity/model.entity";

export class BrandResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "Apple" })
  title: string;

  @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
  createAt: Date;

  @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
  updateAt: Date;

  models?: ModelEntity[];
}
