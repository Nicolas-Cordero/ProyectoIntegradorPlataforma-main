import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Recuperation_Mail } from '../ auth.utils';
import { Transporter } from 'nodemailer';

//TODO: ELIMINAR MAGIC STRINGS
//TODO: ARREGLAR ERROR (ANY) DEBERIA SER UNKNOWN




@Injectable()
export class EmailService {
  private transporter!: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * Inicializa el transporter de nodemailer con la configuración
   */
  private initializeTransporter(): void {
    const emailConfig = {
      host: this.configService.get('email.host'),
      port: this.configService.get('email.port'),
      secure: this.configService.get('email.secure'),
      auth: {
        user: this.configService.get('email.auth.user'),
        pass: this.configService.get('email.auth.pass'),
      },
    };

    // Validar que las credenciales estén configuradas
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      this.logger.warn(
        'Las credenciales de email no están configuradas. '
      );
    }

    this.transporter = nodemailer.createTransport(emailConfig);

    // Verificar la conexión
    this.verifyConnection();
  }





  //TODO ARREGLAR LA EL TEMA DEL ERROR.
  /**
   * Verifica que la conexión con el servidor de email funcione
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Conexión con servidor de email verificada exitosamente');
    } catch (error:any) {
      this.logger.error('❌ Error al verificar conexión con servidor de email:', error.message);
      this.logger.warn('El envío de emails puede fallar. Verifica tu configuración.');
    }
  }





  /**
   * Envía un email con el código de recuperación de contraseña
   * @param email Email del destinatario
   * @param code Código de verificación de 6 dígitos
   */
  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const from = this.configService.get('email.from');
    const expirationMinutes = this.configService.get('email.resetCodeExpiration');

    const mailOptions = {
      from,
      to: email,
      subject: 'Código de Recuperación de Contraseña',
      html: Recuperation_Mail.PASSWORD_RESET_EMAIL(code, expirationMinutes),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`📧 Email de recuperación enviado a: ${email} - ID: ${info.messageId}`);
    } catch (error: any) {
      this.logger.error(`❌ Error al enviar email a ${email}:`, error.message);
      throw new Error('No se pudo enviar el email de recuperación');
    }
  }



  

//ya esta en el enum
  /**
   * Envía un email de notificación cuando la contraseña ha sido cambiada
   * @param email Email del destinatario
   */
  async sendPasswordChangedNotification(email: string): Promise<void> {
    const from = this.configService.get('email.from');

    const mailOptions = {
      from,
      to: email,
      subject: 'Contraseña Actualizada Exitosamente',
      html: Recuperation_Mail.PASSWORD_CHANGE_EMAIL()
    };





    //TODO ARREGLAR ERROR
    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`📧 Notificación de cambio de contraseña enviada a: ${email}`);
    } catch (error: any) {
      this.logger.error(`❌ Error al enviar notificación a ${email}:`, error.message);
      // No lanzar error aquí, es solo una notificación
    }
  }
}
