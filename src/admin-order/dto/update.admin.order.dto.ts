import { ApiProperty } from "@nestjs/swagger";

export class UpdateAdminOrderDto {
  @ApiProperty()
  shipmentUrl: string;
}
