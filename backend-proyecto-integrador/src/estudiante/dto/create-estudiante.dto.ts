import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsNumber,
  IsInt,
  IsDate,
  Matches,
  IsEmail,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Genero } from '@prisma/client';

export class CreateEstudianteDto {
  // CAMPOS OBLIGATORIOS
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{7,8}-[\dkK]$/, {
    message: 'Formato de RUT inválido. Usa XXXXXXXX-D (ej: 12345678-9)',
  })
  rut_estudiante!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  apellido!: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email!: string;

  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @Matches(/^\+569\s?\d{4}\s?\d{4}$/, {
    message: 'Formato inválido. Usa +569 xxxx xxxx o +569xxxxxxxx',
  })
  telefono!: string;

  @Type(() => Number)
  @IsInt({ message: 'generacion_id debe ser un número entero' })
  @IsNotEmpty()
  generacion_id!: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  fecha_nacimiento!: Date;

  @IsNotEmpty()
  @IsString()
  direccion!: string;

  @IsEnum(Genero)
  @IsNotEmpty()
  genero!: Genero;

  @IsString()
  @IsNotEmpty()
  rbd_liceo!: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  puntaje_paes?: number;

  @IsString()
  @IsOptional()
  foto_url?: string;

  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1.0)
  @Max(7.0)
  @IsNotEmpty()
  promedios_media!: number;
}
