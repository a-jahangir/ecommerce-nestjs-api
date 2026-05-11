import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ExampleService } from "./example.service";

@Controller({ path: "example", version: "1" })
@ApiTags("Test-Email")
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get("send-mailgun/:email")
  async sendMailWithMailgun(@Param("email") email: string) {
    return { data: await this.exampleService.sendWelcomeEmailMailgun(email) };
  }

  @Get("send-hostinger/:email")
  async sendMailWithHostinger(@Param("email") email: string) {
    return { data: await this.exampleService.sendWelcomeEmailHostinger(email) };
  }
}
