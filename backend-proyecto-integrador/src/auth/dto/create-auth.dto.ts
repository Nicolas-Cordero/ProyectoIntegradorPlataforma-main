import { IsString, IsNotEmpty, MinLength, IsEmail, IsEnum, IsOptional, Matches } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class LoginDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  @IsString()
  @MinLength(4, { message: 'El username debe tener al menos 4 caracteres' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'El username solo puede contener letras, números, guiones y guiones bajos',
  })
  username: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  // Si quieren agregar restricciones a la pwd, quitar comentario
  /*@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })*/
  password: string;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString()
  apellido: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser Admin, Tutor o Visita' })
  rol?: UserRole;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
