import { ApiProperty } from "@nestjs/swagger";

export class ColorResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "Red" })
  title: string;

  @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
  createAt: Date;

  @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
  updateAt: Date;
}
