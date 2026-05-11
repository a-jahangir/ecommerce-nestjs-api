import { Controller, Req, UseGuards, BadRequestException, Body, Post, Head } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import OtpDto from '../dto/otp.dto';
import LoginDto from '../dto/login.dto';
import RegisterDto from '../dto/register.dto';
import { SendOtpDto } from '../dto/send.otp.dto';
import { login2faDto } from '../dto/login.2fa.dto';
import { DeviceLogoutDto } from '../dto/logout.dto';
import { UserService } from '../service/user.service';
import { NewPasswordDto } from '../dto/new.password.dto';
import { UserAuthGuard } from '../auth/Guard/user.guard';
import { ForgetPasswordDto } from '../dto/forget.password.dto';
import { UserRoleEnum } from '../../shared/enum/user.role.enum';
import { UpdateRefreshTokenDto } from '../dto/update.refresh.dto';
import { UserExpressRequest } from '../auth/types/user-express-request';

@ApiTags('User-Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthUserController {
  constructor(private readonly userService: UserService) {}

  @Post('reset-password')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async resetPassword(@Req() request: UserExpressRequest, @Body() data: NewPasswordDto) {
    return {
      data: await this.userService.resetPassword(request.user, data),
    };
  }

  @Post('forget-password')
  async forgetPassword(@Body() data: ForgetPasswordDto) {
    return {
      data: await this.userService.forgetPassword(data),
    };
  }

  @Post('refresh')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async updateRefreshToken(@Req() request: UserExpressRequest, @Body() data: UpdateRefreshTokenDto) {
    return {
      data: await this.userService.updateRefreshToken(request, data),
    };
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async logoutUser(@Req() request: UserExpressRequest, @Body() data: DeviceLogoutDto) {
    await this.userService.logoutUser(request, data.deviceId);
    return {
      data: {},
    };
  }

  @Post('register')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async register(@Req() req: UserExpressRequest, @Body() data: RegisterDto) {
    if (req.user.role == UserRoleEnum.NEW_USER) {
      const registered = await this.userService.register(req, data);
      if (registered) {
        return {
          data: registered,
        };
      } else new BadRequestException('BAD_REQUEST');
    } else {
      throw new BadRequestException('USER.INVALID');
    }
  }

  @Post('verify')
  async verifyOtpCode(@Body() dto: OtpDto) {
    const { username, otp }: OtpDto = dto;
    // const mobileNumberRegex = /^(?:09|9)[0-9][0-9]{8}$/;
    // const regmob = new RegExp(mobileNumberRegex);
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const regEmail = new RegExp(emailRegex);
    if (!emailRegex.test(username.toLocaleLowerCase())) {
      throw new BadRequestException('EMAIL.INVALID');
    }
    // if (String(username).startsWith('9')) {
    //   otpDto.username = `0${username}`;
    // }
    const result = await this.userService.verifyOtp(dto, true);
    return { data: result };
  }

  // @Get('token/:token')
  // @UseGuards(UserAuthGuard)
  // @ApiBearerAuth()
  // async getAccessToken(
  //   @Param('token') token: string,
  //   @Req() req: UserExpressRequest,
  // ) {
  //   const res = await this.userService.getNewToken(token, req.user.id);
  //   return {
  //     data: res,
  //   };
  // }

  @Post('login')
  async loginByPassword(@Req() request: UserExpressRequest, @Body() data: LoginDto) {
    if (data.password.length < 6) {
      throw new BadRequestException('PASSWORD.IS_SHORT');
    }
    const login = await this.userService.login(data, request);
    return {
      data: login,
    };
  }

  @Post('otp')
  async sendOtp(@Body() dto: SendOtpDto) {
    // const mobileNumberRegex = /^(?:09|9)[0-9][0-9]{8}$/;
    // const regmob = new RegExp(mobileNumberRegex);

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const regEmail = new RegExp(emailRegex);
    if (!emailRegex.test(dto.email.toLocaleLowerCase())) {
      throw new BadRequestException('EMAIL.INVALID');
    }
    // if (String(phone).startsWith('9')) {
    //   phone = `0${phone}`;
    // }
    if ((await this.userService.checkauth(dto.email.toLocaleLowerCase())) == true) {
      return {
        data: await this.userService.sendOtpService(dto.email.toLocaleLowerCase(), true),
      };
    } else throw new BadRequestException('EMAIL.ALREADY_EXISTS');
  }

  @Post('2fa-login')
  async login2fa(@Body() data: login2faDto, @Req() request: UserExpressRequest) {
    return {
      data: await this.userService.login2fa(data, request),
    };
  }

  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @Head('auth')
  public async userTest(@Req() req: UserExpressRequest) {
    return {
      data: null,
    };
  }
}
