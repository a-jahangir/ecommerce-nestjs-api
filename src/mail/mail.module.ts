import { Module } from "@nestjs/common";
import { ExampleService } from "./example/example.service";
import { MailgunMailService } from "./providers/mailgun-mail.service";
import { MailStrategyService } from "./strategy/mail-strategy.service";
import { HostingerMailService } from "./providers/hostinger-mail.service";
import { ExampleController } from "./example/example.controller";

@Module({
  providers: [MailgunMailService, HostingerMailService, MailStrategyService, ExampleService],
  controllers: [ExampleController],
  exports: [MailStrategyService],
})
export class MailModule {}
