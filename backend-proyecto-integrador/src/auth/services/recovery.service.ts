import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersRepository } from "../../users";
import { EmailService } from "./email.service";
import * as bcrypt from 'bcrypt';



@Injectable()
export class RecoveryService{
  constructor( 
    private readonly userRepo: UsersRepository,
    private readonly emailService: EmailService,
  ){}




  /**
   * Genera un código aleatorio de 6 dígitos
   * y su respectivo tiempo de expiración
   * @returns Código de 6 dígitos con 15 mins de tiempo
   */
  generateResetCode(minutes: number): {resetCode: string, expirationDate: Date} {
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Calcular fecha de expiración (15 minutos por defecto)
    const expirationDate = new Date()
    expirationDate.setMinutes(expirationDate.getMinutes() + minutes)
    return {resetCode, expirationDate};
  }






    /**
     * Solicita recuperación de contraseña
     * Genera un código y lo envía por email
     * @param email Email del usuario
     */
    async requestPasswordReset(email: string): Promise<void> {
      // Buscar usuario por email
      const user = await this.userRepo.findByEmail(email)
  


      // Por seguridad, no revelamos si el email existe o no
      // Siempre retornamos éxito para evitar enumeración de usuarios
      if (!user) {
        // Simulamos un delay para que no se pueda distinguir
        await new Promise(resolve => setTimeout(resolve, 1000));
        return;
      }



      /* Será necesario saber si estan activos???????
      // Verificar que el usuario esté activo
      if (!user.activo) {
        // Tampoco revelamos que el usuario está inactivo
        await new Promise(resolve => setTimeout(resolve, 1000));
        return;
      }
      */


  
      // Generar código de 6 dígitos
      const {resetCode, expirationDate} = this.generateResetCode(15);


      // Guardar código y fecha de expiración en la base de datos
      await this.userRepo.updateResetToken(user.rut_usuario, resetCode, expirationDate)

      const hashedResetCode = await bcrypt.hash(resetCode);

      // Enviar email con el código
      try {
        await this.emailService.sendPasswordResetEmail(email, hashedResetCode);
      } catch (error) {


        // Si falla el envío del email, limpiar el código
        await this.userRepo.updateResetToken(user.rut_usuario, null, null);
        
        throw new BadRequestException(
          'No se pudo enviar el email de recuperación. ' +
          'Por favor, verifica tu dirección de email e intenta nuevamente.'
        );
      }
    }


    /**
     * Verifica si un código de recuperación es válido
     * @param email Email del usuario
     * @param code Código de verificación
     * @returns true si el código es válido, false en caso contrario
     */
    async verifyResetCode(email: string, code: string): Promise<boolean> {

      const user = await this.userRepo.findByEmail(email)

      // Si no existe el usuario o no tiene código, retornar false
      if (!user || !user.reset_token|| !user.reset_token_expires) {
        return false;
      }

      // Verificar si el código expiró
      const now = new Date();
      if (now > user.reset_token_expires) {
        // Limpiar código expirado
        await this.userRepo.updateResetToken(user.rut_usuario, null, null)
        return false;
      }

      // Verificar si el código coincide
      return await bcrypt.compare(user.reset_token, code);
    }



      /**
       * Restablece la contraseña del usuario
       * @param email Email del usuario
       * @param code Código de verificación
       * @param newPassword Nueva contraseña
       */
      async resetPassword(
        email: string,
        code: string,
        newPassword: string,
      ): Promise<void> {

        // Buscar usuario
        const user = await this.userRepo.findByEmail(email);

    
        if (!user) {
          throw new NotFoundException('Usuario no encontrado');
        }

    
        /*
        // Verificar que el usuario esté activo
        if (!user.activo) {
          throw new BadRequestException('El usuario no está activo');
        }
        */
    
        // Verificar que exista un código de reset
        if (!user.reset_token || !user.reset_token_expires) {
          throw new BadRequestException(
            'No hay una solicitud de recuperación de contraseña activa. ' +
            'Por favor, solicita un nuevo código.'
          );
        }

    
        // Verificar si el código expiró
        const now = new Date();
        if (now > user.reset_token_expires) {

          // Limpiar código expirado
          await this.userRepo.updateResetToken(user.rut_usuario, null, null);
          
          throw new BadRequestException(
            'El código de recuperación ha expirado. ' +
            'Por favor, solicita un nuevo código.'
          );
        }
    
        // Verificar si el código coincide
        if (!(await bcrypt.compare(code, user.reset_token))) {
          throw new BadRequestException(
            'El código de verificación es inválido'
          );
        }
    
        // Validar que la nueva contraseña no sea igual a la anterior
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
          throw new BadRequestException(
            'La nueva contraseña no puede ser igual a la anterior'
          );
        }
    
        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
    
        // Actualizar contraseña y limpiar código de reset
        await this.userRepo.updatePassword(user.rut_usuario, hashedPassword);
        
        // Invalidar refresh tokens existentes por seguridad
        await this.userRepo.updateResetToken(user.rut_usuario, null, null);
    
        // Enviar email de notificación (opcional, no falla si hay error)
        try {
          await this.emailService.sendPasswordChangedNotification(email);
        } catch (error) {
          // Log el error pero no fallar el proceso
          console.error('Error al enviar notificación de cambio de contraseña:', error);
        }
      }
    

}