import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";

export class CreateTagDto {
  @ApiProperty()
  @IsArray()
  values: string[];
}
