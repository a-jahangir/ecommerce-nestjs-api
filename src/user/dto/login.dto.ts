import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'email', example: 'test@test.com' })
  email: string;
  @ApiProperty({ description: 'password', example: 'strong password' })
  password: string;
}

export default LoginDto;
