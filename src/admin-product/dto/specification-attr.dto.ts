// src/products/dto/specification-attribute.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class SpecificationAttributeDto {
  @ApiProperty({ example: "Processor" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "A16 Bionic" })
  @IsString()
  @IsNotEmpty()
  value: string;
}
