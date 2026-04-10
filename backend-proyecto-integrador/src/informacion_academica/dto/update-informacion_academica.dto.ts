import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateInformacionAcademicaDto {
  @IsNumber()
  @IsOptional()
  promedio_1?: number;

  @IsNumber()
  @IsOptional()
  promedio_2?: number;

  @IsNumber()
  @IsOptional()
  promedio_3?: number;

  @IsNumber()
  @IsOptional()
  promedio_4?: number;

  @IsString()
  @IsOptional()
  via_acceso?: string;

  @IsNumber()
  @IsOptional()
  año_ingreso_beca?: number;

  @IsString()
  @IsOptional()
  colegio?: string;

  @IsString()
  @IsOptional()
  especialidad_colegio?: string;

  @IsString()
  @IsOptional()
  comuna_colegio?: string;

  @IsString()
  @IsOptional()
  trayectoria_academica?: string;

  @IsOptional()
  puntajes_admision?: any; // JSONB flexible

  @IsOptional()
  ensayos_paes?: any[]; // Array JSONB flexible

  @IsString()
  @IsOptional()
  beneficios?: string; // Descripción de beneficios

  @IsOptional()
  resumen_semestres?: any[];

  @IsString()
  @IsOptional()
  ultima_actualizacion_por?: string;

  @IsNumber()
  @IsOptional()
  promedio_acumulado?: number;
}
