import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsArray, ValidateNested } from "class-validator";
import { SpecificationAttributeDto } from "./specification-attr.dto";

export class CreateSpecificationDto {
  @ApiProperty({ example: "Technical Specifications" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: [SpecificationAttributeDto] })
  @IsArray()
  @Type(() => SpecificationAttributeDto)
  attributes: SpecificationAttributeDto[];
}
