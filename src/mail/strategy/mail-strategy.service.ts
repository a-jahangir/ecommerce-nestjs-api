import { Injectable } from "@nestjs/common";
import { MailgunMailService } from "../providers/mailgun-mail.service";
import { MailService } from "../../shared/interface/mail-service.interface";
import { HostingerMailService } from "../providers/hostinger-mail.service";
import { MailProviderEnum } from "../enum/mail-provider.enum";

@Injectable()
export class MailStrategyService {
  private readonly strategies: Map<string, MailService> = new Map();

  constructor(
    private readonly mailgunMailService: MailgunMailService,
    private readonly hostingerMailService: HostingerMailService
  ) {
    // Register available strategies
    this.strategies.set(MailProviderEnum.mailgun, mailgunMailService);
    this.strategies.set(MailProviderEnum.hostinger, hostingerMailService);
  }

  getStrategy(provider: string): MailService {
    const strategy = this.strategies.get(provider);

    if (!strategy) {
      throw new Error(`Mail provider "${provider}" not supported`);
    }

    return strategy;
  }
}
