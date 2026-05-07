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
}






export class RegisterDto {

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


  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;


  @IsOptional()
  @IsEnum(UserRol, { message: 'El rol debe ser Admin, Tutor o Visita' })
  rol!: UserRol;
}



export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
