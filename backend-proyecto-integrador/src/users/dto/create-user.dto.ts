import { UserRol } from '@prisma/client';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsEnum,
  Matches
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  rut_usuario!: string;


  @IsString()
  @IsNotEmpty()
  nombre!: string;


  @IsString()
  @IsNotEmpty()
  apellido!: string;


  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email!: string;


  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @Matches(/^\+569\s?\d{4}\s?\d{4}$/, {
    message: 'Formato inválido. Usa +569 xxxx xxxx o +569xxxxxxxx',
  })
  telefono!: string;


  @IsNotEmpty()
  @IsEnum(UserRol)
  rol!: UserRol;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
