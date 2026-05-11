import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'password', example: '@Aa123456' })
  password: string;

  @ApiProperty({ description: 'firstName', example: 'test' })
  @ApiPropertyOptional()
  firstName?: string;

  @ApiProperty({ description: 'lastName', example: 'test' })
  @ApiPropertyOptional()
  lastName?: string;

  @ApiProperty({ description: 'ref_code', example: '112233DD' })
  @ApiPropertyOptional()
  referralCode?: string;
}

export default RegisterDto;
