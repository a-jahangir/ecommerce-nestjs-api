import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserAddressDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @ApiPropertyOptional()
  firstName?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  lastName?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  email?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  countryId?: number;

  @ApiProperty()
  @ApiPropertyOptional()
  city?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  streetAddress?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  postalCode?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  houseNumber?: string;
}
