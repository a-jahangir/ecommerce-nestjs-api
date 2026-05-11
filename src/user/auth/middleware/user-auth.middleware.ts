import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { verify } from 'jsonwebtoken';
import appEnvConfig from '../../../config/app.env.config';
import { UserService } from '../../service/user.service';
import { UserExpressRequest } from '../types/user-express-request';

@Injectable()
export class UserAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService<
      ConfigType<typeof appEnvConfig>
    >,
    private readonly userService: UserService,
  ) {}

  async use(req: UserExpressRequest, res: any, next: (error?: any) => void) {
    try {
      if (!req.headers.authorization) {
        req.user = null;
        next();
        return;
      }

      let decode;

      if (req.path.includes('refresh')) {
        decode = verify(
          req.headers.authorization.split(' ')[1],
          this.configService.get('user', {
            infer: true,
          })?.userJwtSecret || '',
          { ignoreExpiration: true },
        );
      } else {
        decode = !req.path.includes('reset-password')
          ? verify(
              req.headers.authorization.split(' ')[1],
              this.configService.get('user', {
                infer: true,
              })?.userJwtSecret || '',
            )
          : verify(
              req.headers.authorization.split(' ')[1],
              this.configService.get('user', {
                infer: true,
              })?.userResetPasswordSecret || '',
            );
      }

      let fundUser;
      if (req.path.includes('register')) {
        fundUser = await this.userService.findUser(
          req,
          decode['userId'],
          decode['role'],
          false,
        );
      } else {
        fundUser = await this.userService.findUser(
          req,
          decode['userId'],
          decode['role'],
          true,
        );
      }

      req.user = fundUser;
      next();
    } catch (e) {
      req.user = null;
      next();
    }
  }
}
