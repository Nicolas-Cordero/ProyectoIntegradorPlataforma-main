import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;
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

  /**
   * Verifica que la conexión con el servidor de email funcione
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Conexión con servidor de email verificada exitosamente');
    } catch (error) {
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
      html: this.getPasswordResetEmailTemplate(code, expirationMinutes),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`📧 Email de recuperación enviado a: ${email} - ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`❌ Error al enviar email a ${email}:`, error.message);
      throw new Error('No se pudo enviar el email de recuperación');
    }
  }

  /**
   * Genera el template HTML para el email de recuperación
   * @param code Código de verificación
   * @param expirationMinutes Minutos de expiración
   * @returns HTML del email
   */
  private getPasswordResetEmailTemplate(code: string, expirationMinutes: number): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .code-container {
            background: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 8px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
          }
          .code {
            font-size: 42px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #667eea;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning-icon {
            color: #856404;
            font-weight: bold;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #dee2e6;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            margin: 20px 0;
          }
          .info-box {
            background: #e7f3ff;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Recuperación de Contraseña</h1>
          </div>
          
          <div class="content">
            <h2 style="color: #333; margin-top: 0;">Hola,</h2>
            <p>Has solicitado restablecer tu contraseña. Usa el siguiente código de verificación:</p>
            
            <div class="code-container">
              <div class="code">${code}</div>
            </div>
            
            <div class="info-box">
              <strong>📱 Instrucciones:</strong>
              <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Ingresa este código en la página de recuperación</li>
                <li>El código tiene exactamente 6 dígitos</li>
                <li>Es sensible a mayúsculas y minúsculas</li>
              </ol>
            </div>
            
            <div class="warning">
              <span class="warning-icon">⚠️</span>
              <strong>Importante:</strong> Este código expirará en <strong>${expirationMinutes} minutos</strong>.
            </div>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá sin cambios.
            </p>
            
            <p style="color: #6c757d; font-size: 14px; margin-top: 20px;">
              Por tu seguridad, nunca compartas este código con nadie.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">
              <strong>Sistema de Gestión de Becarios</strong><br>
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

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
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Contraseña Actualizada</h1>
            </div>
            <div class="content">
              <p>Tu contraseña ha sido actualizada exitosamente.</p>
              <p>Si no realizaste este cambio, por favor contacta al administrador inmediatamente.</p>
              <p>Fecha y hora: ${new Date().toLocaleString('es-ES')}</p>
            </div>
            <div class="footer">
              <p>Sistema de Gestión de Becarios</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`📧 Notificación de cambio de contraseña enviada a: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Error al enviar notificación a ${email}:`, error.message);
      // No lanzar error aquí, es solo una notificación
    }
  }
}
