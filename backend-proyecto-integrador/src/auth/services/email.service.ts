import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Recuperation_Mail } from '../auth.utils';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter!: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const host = this.configService.get<string>('email.host');
    const port = Number(this.configService.get<number>('email.port'));
    const user = this.configService.get<string>('email.auth.user');
    const pass = this.configService.get<string>('email.auth.pass');

    if (!host || !port || !user || !pass) {
      throw new Error('Email configuration missing in env');
    }

    const emailConfig = {
      host,
      port,
      secure: port === 465, // importante
      auth: {
        user,
        pass,
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);

    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('Email server OK');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Email connection error: ${message}`);
    }
  }

  private get senderHeader(): string {
    const fromEmail = this.configService.getOrThrow<string>('email.from');
    const fromName = this.configService.getOrThrow<string>('email.fromName');
    return `"${fromName}" <${fromEmail}>`;
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const expirationMinutes = this.configService.get<number>('email.resetCodeExpiration') || 15;

    const mailOptions = {
      from: this.senderHeader,
      to: email,
      subject: 'Código de Recuperación de Contraseña',
      html: Recuperation_Mail.PASSWORD_RESET_EMAIL(code, expirationMinutes),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email enviado a ${email} - ${info.messageId}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error sending email: ${message}`);
      throw new Error('Email send failed');
    }
  }

  async sendPasswordChangedNotification(email: string): Promise<void> {
    const mailOptions = {
      from: this.senderHeader,
      to: email,
      subject: 'Contraseña Actualizada Exitosamente',
      html: Recuperation_Mail.PASSWORD_CHANGE_EMAIL(),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Notificación enviada a ${email}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error sending notification: ${message}`);
    }
  }
}