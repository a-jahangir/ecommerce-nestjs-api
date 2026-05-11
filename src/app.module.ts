import { Module, OnModuleInit } from "@nestjs/common";
import { AcceptLanguageResolver, I18nModule } from "nestjs-i18n";
import { join } from "path";
import * as path from "path";
import { ConfigModule, ConfigService, ConfigType } from "@nestjs/config";
import appEnvConfig from "./config/app.env.config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user.module";
import { AdminModule } from "./admin/admin.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { BaseinfoModule } from "./baseinfo/baseinfo.module";
import { AdminUserModule } from "./admin-user/admin-user.module";
import { FileModule } from "./file/file.module";
import { WinstonLoggerService } from "./logger/winston.logger";
import { AdminProductModule } from "./admin-product/admin-product.module";
import { PaymentModule } from "./payment/payment.module";
import { AdminDiscountModule } from "./admin-discount/admin-discount.module";
import { UserProductModule } from "./user-product/user-product.module";
import { UserOrderModule } from "./user-order/user-order.module";
import { AdminOrderModule } from "./admin-order/admin-order.module";
import { EventsModule } from "./event/even.module";
import { PaymentEventDispatcher } from "./payment/payment-event.dispacher";
import { UserOrderService } from "./user-order/user-order.service";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), "public"),
      // serveRoot: 'static',s
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<ConfigType<typeof appEnvConfig>>) => ({
        secret: configService.get("user", { infer: true }).userJwtRefSecret,
        signOptions: {
          expiresIn: configService.get("user", { infer: true }).userJwtRefExpirationTime,
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<ConfigType<typeof appEnvConfig>>) => {
        const postgresConfig = configService.get("postgres", { infer: true });
        return {
          type: "postgres",
          host: postgresConfig.url,
          port: +postgresConfig.port,
          username: postgresConfig.username,
          password: postgresConfig.password,
          database: postgresConfig.dbname,
          entities: ["dist/**/*.entity{.ts,.js}"],
          migrations: ["dist/migrations/**/*{.ts,.js}"],
          synchronize: false,
          migrationsRun: true,
          logging: ["warn", "error"],
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appEnvConfig],
    }),
    I18nModule.forRoot({
      fallbackLanguage: "en",
      loaderOptions: {
        path: join(__dirname, "i18n"),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    AdminModule,
    UserModule,
    BaseinfoModule,
    AdminUserModule,
    FileModule,
    AdminProductModule,
    PaymentModule,
    AdminDiscountModule,
    UserProductModule,
    UserOrderModule,
    AdminOrderModule,
    PaymentModule,
    UserOrderModule,
    EventsModule,
  ],
  providers: [WinstonLoggerService],
  exports: [WinstonLoggerService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly eventDispatcher: PaymentEventDispatcher,
    private readonly userOrderService: UserOrderService
  ) {}

  onModuleInit() {
    // Register the UserOrderService as a payment event handler
    this.eventDispatcher.registerHandler(this.userOrderService);
  }
}
