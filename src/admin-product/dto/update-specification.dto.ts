import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsArray } from "class-validator";
import { SpecificationAttributeDto } from "./specification-attr.dto";

export class UpdateSpecificationDto {
  @ApiProperty({ example: "Technical Specifications" })
  @IsString()
  title?: string;

  @ApiProperty({ type: [SpecificationAttributeDto] })
  @IsArray()
  @Type(() => SpecificationAttributeDto)
  attributes: SpecificationAttributeDto[];
}
