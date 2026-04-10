import { IsEmail, IsString, Length, MinLength } from 'class-validator';

/**
 * DTO para solicitar recuperación de contraseña
 */
export class RequestPasswordResetDto {
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;
}

/**
 * DTO para verificar código de recuperación
 */
export class VerifyResetCodeDto {
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @IsString({ message: 'El código debe ser una cadena de texto' })
  @Length(6, 6, { message: 'El código debe tener exactamente 6 caracteres' })
  code: string;
}

/**
 * DTO para restablecer contraseña
 */
export class ResetPasswordDto {
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @IsString({ message: 'El código debe ser una cadena de texto' })
  @Length(6, 6, { message: 'El código debe tener exactamente 6 caracteres' })
  code: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  newPassword: string;
}
