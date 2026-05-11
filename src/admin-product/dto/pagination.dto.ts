// src/common/dto/pagination.dto.ts
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsPositive()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  search?: string;
}
