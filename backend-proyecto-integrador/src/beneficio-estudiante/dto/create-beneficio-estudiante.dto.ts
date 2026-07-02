import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EstadoBeneficio } from '@prisma/client';

export class CreateBeneficioEstudianteDto {
  @IsString()
  @IsNotEmpty()
  rut_estudiante!: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  codigo_beneficio!: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  inicio!: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  fin!: Date;

  @IsEnum(EstadoBeneficio)
  @IsOptional()
  estado!: EstadoBeneficio;
}
