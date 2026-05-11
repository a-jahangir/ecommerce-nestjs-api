import { ApiProperty } from "@nestjs/swagger";

export class CreateUserAddressDto {
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  phone: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  countryId: number;
  @ApiProperty()
  city: string;
  @ApiProperty()
  streetAddress: string;
  @ApiProperty()
  postalCode: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  houseNumber: string;
}
