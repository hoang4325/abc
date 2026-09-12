import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>("SMTP_HOST");
    const user = this.configService.get<string>("SMTP_USER");
    const pass = this.configService.get<string>("SMTP_PASSWORD");

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.configService.get<number>("SMTP_PORT", 587),
        secure: false,
        auth: { user, pass },
      });
    }
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    const from = this.configService.get<string>("SMTP_FROM", "noreply@sharedeal.vn");

    if (this.transporter) {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: "Yêu cầu đặt lại mật khẩu - ShareDeal",
        html: `<p>Xin chào,</p><p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng bấm vào liên kết dưới đây:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Liên kết sẽ hết hạn sau 1 giờ.</p>`,
      });
    } else {
      this.logger.log(`[DEV MODE] Password reset email for ${email}: ${resetUrl}`);
    }
  }
}
