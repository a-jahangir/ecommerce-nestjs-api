import { ConfigService, ConfigType } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import appEnvConfig from "../../config/app.env.config";
import { MailService } from "../../shared/interface/mail-service.interface";

@Injectable()
export class HostingerMailService implements MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService<ConfigType<typeof appEnvConfig>>) {
    const smtpConfig = configService.get("mailProviders", {
      infer: true,
    }).hostinger;

    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: true,
      auth: {
        type: "LOGIN",
        user: smtpConfig.email,
        pass: smtpConfig.password,
      },
      // tls: {
      //   ciphers: "SSLv3",
      // },
    });

    this.transporter.verify((error) => {
      if (error) {
        console.error("SMTP connection error:", error);
      } else {
        console.log("SMTP server is ready to take our messages");
      }
    });
  }

  async sendMail(to: string, subject: string, body: string): Promise<void> {
    const smtpConfig = this.configService.get("mailProviders", {
      infer: true,
    }).hostinger;

    const mailOptions = {
      from: smtpConfig.email,
      to,
      subject,
      html: body,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Message sent: %s", info.messageId);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}
