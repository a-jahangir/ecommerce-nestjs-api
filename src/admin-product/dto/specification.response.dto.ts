// src/products/dto/specification-response.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { AttributeResponseDto } from "./attribute.response.dto";
import { ProductSpecificationEntity } from "../entity/product.spicification.entity";

export class SpecificationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "Technical Specifications" })
  title: string;

  @ApiProperty({ type: [AttributeResponseDto] })
  attributes: AttributeResponseDto[];
}
