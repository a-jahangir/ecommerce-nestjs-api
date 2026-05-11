import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import LoginDto from '../../user/dto/login.dto';
import { AdminEntity } from '../entity/admin.entity';
import appEnvConfig from '../../config/app.env.config';
import { UserRoleEnum } from '../../shared/enum/user.role.enum';
import TokenPayload from '../../shared/interface/tokenPayload.interface';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepo: Repository<AdminEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigType<typeof appEnvConfig>>
  ) {}

  async login(data: LoginDto) {
    const user = await this.adminRepo.findOne({
      where: {
        email: data.email,
      },
    });
    if (user) {
      const passed = await bcrypt.compare(data.password, user.hashPassword);
      if (passed) {
        return {
          access_token: await this.makeJwtToken(user.id, UserRoleEnum.ADMIN),
        };
      } else throw new BadRequestException('PASSWORD.INVALID');
    } else throw new BadRequestException('USER.NOT_FOUND');
  }

  private async makeJwtToken(userId: string, role: UserRoleEnum) {
    const payload: TokenPayload = { userId, role };
    const token = this.jwtService.sign(payload);
    return token;
  }

  public async UserTest() {
    return true;
  }

  public async findAdmin(userId: string, role: UserRoleEnum) {
    if (role == UserRoleEnum.ADMIN) {
      const admin = await this.adminRepo.findOne({ where: { id: userId } });
      if (admin) return admin;
      return null;
    }
    return null;
  }
}
