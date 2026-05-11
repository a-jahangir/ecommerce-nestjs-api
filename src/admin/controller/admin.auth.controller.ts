import { BadRequestException, Body, Controller, Head, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import LoginDto from '../../user/dto/login.dto';
import { AdminService } from '../service/admin.service';
import { AdminAuthGuard } from '../auth/Guard/admin.guard';
import { AdminExpressRequest } from '../auth/types/adminExpressRequest';

@ApiTags('Admin-Auth')
@Controller({ version: '1', path: 'admin/auth' })
export class AdminAuthController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async loginByPassword(@Body() data: LoginDto) {
    if (data.password.length < 6) {
      throw new BadRequestException('PASSWORD.IS_SHORT');
    }
    const login = await this.adminService.login(data);
    return {
      data: login,
    };
  }

  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @Head('auth')
  public async userTest(@Req() req: AdminExpressRequest) {
    return {
      data: await this.adminService.UserTest(),
    };
  }
}
