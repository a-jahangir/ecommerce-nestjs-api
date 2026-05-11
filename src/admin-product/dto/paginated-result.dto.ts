import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsArray, ValidateNested } from "class-validator";

export class PaginationMetaDto {
  @ApiProperty({
    example: 100,
    description: "Total number of items",
  })
  @IsNumber()
  total: number;

  @ApiProperty({
    example: 1,
    description: "Current page number",
  })
  @IsNumber()
  page: number;

  @ApiProperty({
    example: 10,
    description: "Number of items per page",
  })
  @IsNumber()
  limit: number;

  @ApiProperty({
    example: 10,
    description: "Total number of pages",
  })
  @IsNumber()
  totalPages: number;
}

export class PaginatedResultDto<T> {
  @ApiProperty({
    isArray: true,
    description: "Array of items",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Array)
  data: T[];

  @ApiProperty({
    type: PaginationMetaDto,
    description: "Pagination metadata",
  })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  pagination: PaginationMetaDto;

  constructor(data: T[], meta: PaginationMetaDto) {
    this.data = data;
    this.pagination = meta;
  }

  static fromResult<T>(result: { data: T[]; total: number; page: number; limit: number }): PaginatedResultDto<T> {
    const totalPages = Math.ceil(result.total / result.limit);
    return new PaginatedResultDto(result.data, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages,
    });
  }
}
