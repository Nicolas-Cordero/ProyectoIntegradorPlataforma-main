import { ViaAcceso } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString, Min, Max } from 'class-validator';

export class CreateCarreraDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsNotEmpty()
  @IsString()
  rut_estudiante!: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  duracion_sem!: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  codigo_universidad!: number;

  @IsEnum(ViaAcceso)
  @IsNotEmpty()
  via_acceso!: ViaAcceso;

  @Type(() => Number)
  @IsInt({ message: 'El año de ingreso debe ser un número entero' })
  @Min(1990, { message: 'El año de ingreso mínimo es 1990' })
  @Max(2100, { message: 'El año de ingreso máximo es 2100' })
  anio_ingreso!: number;
}
