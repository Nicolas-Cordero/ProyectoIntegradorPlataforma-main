import { IsString, IsNotEmpty, MinLength, IsEmail, IsEnum, IsOptional, Matches } from 'class-validator';
import { UserRol } from '@prisma/client';

export class LoginDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  client?: 'web' | 'mobile';
}






export class RegisterDto {

  @IsNotEmpty({ message: 'El rut es requerido' })
  @IsString()
  @Matches(/^\d{7,8}-[\dkK]$/, { message: 'Formato de RUT inválido. Usa XXXXXXXX-D (ej: 12345678-9)' })
  rut!: string;
  
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  nombre!: string;


  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString()
  apellido!: string;


  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email!: string;


  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @Matches(/^\+569\s?\d{4}\s?\d{4}$/, {
    message: 'Formato inválido. Usa +569 xxxx xxxx o +569xxxxxxxx',
  })
  telefono!: string;


  // La contraseña ya no se recibe: se asigna automáticamente el RUT sin dígito
  // verificador, con cambio forzado en el primer ingreso.

  @IsNotEmpty({ message: 'El rol es requerido' })
  @IsEnum(UserRol, { message: 'El rol debe ser Admin, Tutor o Visita' })
  rol!: UserRol;
}



export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
