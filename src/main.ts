import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import basicAuth from "express-basic-auth";
import { ConfigService, ConfigType } from "@nestjs/config";
import appEnvConfig from "./config/app.env.config";
import { ResponseInterceptor } from "./shared/interceptor/response.interceptor";
import { HttpExceptionFilter } from "./shared/filter/http.filter";
import { configureSwagger } from "./config/swagger.config";
import { WinstonLoggerService } from "./logger/winston.logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService<ConfigType<typeof appEnvConfig>>);

  const swaggerInfo = configService.get("swagger", { infer: true }) as { username: string; password: string } | undefined;
  if (swaggerInfo?.username && swaggerInfo?.password) {
    app.use(
      ["/swagger", "/swagger-json"],
      basicAuth({
        challenge: true,
        users: {
          [swaggerInfo.username]: swaggerInfo.password,
        },
      })
    );
  }

  app.setGlobalPrefix("api");

  app.useGlobalPipes(new ValidationPipe());

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: "v",
    defaultVersion: "1",
  });
  const logger = app.get(WinstonLoggerService);
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  app.useGlobalInterceptors(new ResponseInterceptor(logger));

  // Call Swagger configuration
  configureSwagger(app);

  // Other app configurations (e.g., CORS)
  app.enableCors();

  await app.listen(process.env.APP_APP_INTERNAL_PORT || 3000);
}
bootstrap();
