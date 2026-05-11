// src/products/dto/tag-response.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class TagResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "flagship" })
  value: string;
}
