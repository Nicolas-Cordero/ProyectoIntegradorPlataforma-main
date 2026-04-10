import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateInformacionAcademicaDto {
  @IsString()
  @IsNotEmpty()
  id_estudiante: string;

  @IsOptional()
  @IsNumber()
  promedio_1?: number;

  @IsOptional()
  @IsNumber()
  promedio_2?: number;

  @IsOptional()
  @IsNumber()
  promedio_3?: number;

  @IsOptional()
  @IsNumber()
  promedio_4?: number;

  @IsOptional()
  @IsString()
  via_acceso?: string;

  @IsOptional()
  @IsNumber()
  año_ingreso_beca?: number;

  @IsOptional()
  @IsString()
  colegio?: string;

  @IsOptional()
  @IsString()
  especialidad_colegio?: string;

  @IsOptional()
  @IsString()
  comuna_colegio?: string;

  @IsOptional()
  @IsString()
  trayectoria_academica?: string;

  @IsOptional()
  puntajes_admision?: any;

  @IsOptional()
  ensayos_paes?: any[];

  @IsOptional()
  @IsString()
  beneficios?: string;

  @IsOptional()
  resumen_semestres?: any[];

  @IsOptional()
  @IsString()
  ultima_actualizacion_por?: string;

  @IsOptional()
  @IsNumber()
  promedio_acumulado?: number;
}
