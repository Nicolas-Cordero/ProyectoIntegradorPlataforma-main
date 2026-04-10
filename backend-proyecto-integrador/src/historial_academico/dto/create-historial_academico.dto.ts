import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateHistorialAcademicoDto {
  @IsString()
  @IsNotEmpty()
  id_estudiante: string;

  // === CAMPOS MIGRADOS A PERIODO_ACADEMICO ===
  // año y semestre fueron eliminados
  // Usar PeriodoAcademicoEstudiante para relacionar con períodos
  @IsOptional()
  @IsNumber()
  año?: number;

  @IsOptional()
  @IsNumber()
  semestre?: number;

  @IsOptional()
  @IsString()
  nivel_educativo?: string;

  @IsOptional()
  @IsNumber()
  ramos_aprobados?: number;

  @IsOptional()
  @IsNumber()
  ramos_reprobados?: number;

  @IsOptional()
  @IsNumber()
  ramos_eliminados?: number;

  @IsOptional()
  @IsNumber()
  promedio_semestre?: number;

  @IsOptional()
  trayectoria_academica?: string[];

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  comentarios_generales?: string;

  @IsOptional()
  @IsString()
  dificultades?: string;

  @IsOptional()
  @IsString()
  aprendizajes?: string;

  @IsOptional()
  @IsString()
  ultima_actualizacion_por?: string;
}
