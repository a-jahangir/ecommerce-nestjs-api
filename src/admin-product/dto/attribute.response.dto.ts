// src/products/dto/attribute-response.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { SpecificationAttributeEntity } from "../entity/specification.attribute.entity";

export class AttributeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "Processor" })
  title: string;

  @ApiProperty({ example: "A16 Bionic" })
  value: string;
}
