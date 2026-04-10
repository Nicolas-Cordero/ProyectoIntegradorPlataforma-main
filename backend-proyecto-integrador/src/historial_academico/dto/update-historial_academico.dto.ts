import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UpdateHistorialAcademicoDto {
  @Expose()
  @IsNumber()
  @IsOptional()
  año?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  semestre?: number;

  @Expose()
  @IsString()
  @IsOptional()
  nivel_educativo?: string;

  @Expose()
  @IsNumber()
  @IsOptional()
  ramos_aprobados?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  ramos_reprobados?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  ramos_eliminados?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  promedio_semestre?: number;

  @Expose()
  @IsOptional()
  trayectoria_academica?: string[]; // Array de textos incrementales

  @Expose()
  @IsString()
  @IsOptional()
  observaciones?: string;

  @Expose()
  @IsString()
  @IsOptional()
  comentarios_generales?: string;

  @Expose()
  @IsString()
  @IsOptional()
  dificultades?: string;

  @Expose()
  @IsString()
  @IsOptional()
  aprendizajes?: string;

  @Expose()
  @IsString()
  @IsOptional()
  ultima_actualizacion_por?: string;
}
