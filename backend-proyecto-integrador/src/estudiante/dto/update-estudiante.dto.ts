import { PartialType } from '@nestjs/mapped-types';
import { CreateEstudianteDto } from './create-estudiante.dto';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
  IsEnum,
  IsUUID,
  IsNumber,
  MinLength,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { TipoEstudiante } from '../entities/estudiante.entity';

@Exclude()
export class UpdateEstudianteDto extends PartialType(CreateEstudianteDto) {
  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @Expose()
  @IsOptional()
  @IsString()
  rut?: string;

  @Expose()
  @IsOptional()
  @IsString()
  telefono?: string;

  @Expose()
  @IsOptional()
  @IsDateString()
  fecha_de_nacimiento?: string;

  @Expose()
  @IsOptional()
  @IsEmail()
  email?: string;

  @Expose()
  @IsOptional()
  @IsEnum(TipoEstudiante)
  tipo_de_estudiante?: TipoEstudiante;

  @Expose()
  @IsOptional()
  @IsUUID()
  institucionId?: string;
  
  @Expose()
  @IsOptional()
  @IsString()
  generacion?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  numero_carrera?: number;

  @Expose()
  @IsOptional()
  @IsString()
  genero?: string;

  @Expose()
  @IsOptional()
  @IsString()
  direccion?: string;

  @Expose()
  @IsOptional()
  @IsString()
  observaciones?: string;

  @Expose()
  @IsOptional()
  @IsString()
  status_detalle?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  semestres_suspendidos?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  semestres_total_carrera?: number;

  @Expose()
  @IsOptional()
  @IsString()
  foto_url?: string;
}
