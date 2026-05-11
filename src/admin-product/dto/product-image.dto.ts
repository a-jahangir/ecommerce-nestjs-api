import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class ProductImageDto {
  @ApiProperty({ title: " path of file uploaded" })
  @IsString()
  path: string;

  @ApiProperty({ example: [1, 3, 4, 5] })
  @IsNumber()
  index: number;
}
