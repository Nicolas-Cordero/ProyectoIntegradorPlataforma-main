import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateRamosCursadosDto {
  @IsString()
  @IsNotEmpty()
  id_estudiante: string;

  // === CAMPOS MIGRADOS A PERIODO_ACADEMICO ===
  // año y semestre fueron eliminados, usar periodo_academico_estudiante_id
  @IsOptional()
  @IsUUID()
  periodo_academico_estudiante_id?: string;

  @IsOptional()
  @IsNumber()
  oportunidad?: number;

  @IsOptional()
  @IsString()
  codigo_ramo?: string;

  @IsOptional()
  @IsString()
  nivel_educativo?: string;

  @IsOptional()
  @IsString()
  nombre_ramo?: string;

  @IsOptional()
  notas_parciales?: any;

  @IsOptional()
  @IsNumber()
  promedio_final?: number;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  comentarios?: string;
}
