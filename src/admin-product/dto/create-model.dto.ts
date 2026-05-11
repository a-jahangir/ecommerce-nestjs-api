import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, IsNotEmpty, MaxLength } from "class-validator";
import { CategoryEnum } from "../enum/category.enum";

export class CreateModelDto {
  @ApiProperty({
    enum: CategoryEnum,
    example: CategoryEnum.MOBILE,
    description: "Category of the model",
  })
  @IsEnum(CategoryEnum)
  category: CategoryEnum;

  @ApiProperty({
    example: "iPhone 15 Pro",
    description: "Name of the model",
    maxLength: 255,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;
}
