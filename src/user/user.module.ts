import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { ConfigService, ConfigType } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { MailModule } from "../mail/mail.module";
import { UserEntity } from "./entity/user.entity";
import appEnvConfig from "../config/app.env.config";
import { RedisModule } from "../redis/redis.module";
import { UserService } from "./service/user.service";
import { BaseinfoModule } from "../baseinfo/baseinfo.module";
import { UserDeviceEntity } from "./entity/user.device.entity";
import { UserProfileEntity } from "./entity/user.profile.entity";
import { UserSettingEntity } from "./entity/user.setting.entity";
import { AuthUserController } from "./controller/user.auth.controller";
import { User2FASettingEntity } from "./entity/user.2fa.setting.entity";
import { UserLoginHistoryEntity } from "./entity/user.login.history.entity";
import { UserRefreshTokenEntity } from "./entity/user.refresh.token.entity";
import { UserAuthMiddleware } from "./auth/middleware/user-auth.middleware";
import { UserProfileController } from "./controller/profile.user.controller";
import { UserAddressEntity } from "./entity/user.address.entity";

@Module({
  imports: [
    RedisModule,
    BaseinfoModule,
    MailModule,
    TypeOrmModule.forFeature([
      UserEntity,
      UserProfileEntity,
      UserSettingEntity,
      UserLoginHistoryEntity,
      UserDeviceEntity,
      UserRefreshTokenEntity,
      User2FASettingEntity,
      UserAddressEntity,
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<ConfigType<typeof appEnvConfig>>) => ({
        secret: configService.get("user", { infer: true }).userJwtSecret,
        signOptions: {
          expiresIn: configService.get("user", { infer: true }).userJwtExpirationTime,
        },
      }),
    }),
  ],
  providers: [UserService],
  controllers: [AuthUserController, UserProfileController],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAuthMiddleware).forRoutes({
      path: "*",
      method: RequestMethod.ALL,
    });
  }
}
