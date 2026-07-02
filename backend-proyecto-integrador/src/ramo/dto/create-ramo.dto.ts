import { EstadoRamo } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateRamoDto {
  @Type(() => Number)
  @IsInt({ message: 'semestre_id debe ser un número entero' })
  @IsNotEmpty()
  semestre_id!: number;

  @IsString()
  @IsNotEmpty()
  rut_estudiante!: string;

  @Type(() => Number)
  @IsInt({ message: 'codigo_carrera debe ser un número entero' })
  @IsNotEmpty()
  codigo_carrera!: number;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEnum(EstadoRamo)
  @IsNotEmpty()
  estado!: EstadoRamo;

  @IsString()
  @IsOptional()
  comentario?: string;

  @Type(() => Number)
  @IsInt({ message: 'intento debe ser un número entero' })
  @IsOptional()
  intento?: number;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 1 },
    { message: 'nota_final debe ser un número con máximo 1 decimal' },
  )
  @Min(1, { message: 'nota_final mínima es 1.0' })
  @Max(7, { message: 'nota_final máxima es 7.0' })
  @IsOptional()
  nota_final?: number;
}
