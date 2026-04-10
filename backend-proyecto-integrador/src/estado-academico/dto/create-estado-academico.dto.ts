import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { StatusEstudiante } from '../entities/estado-academico.entity';

export class CreateEstadoAcademicoDto {
  @IsUUID()
  @IsNotEmpty()
  estudiante_id: string;

  @IsEnum(StatusEstudiante)
  @IsNotEmpty()
  status: StatusEstudiante;

  @IsString()
  @IsOptional()
  status_detalle?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  semestres_cursados?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  semestres_suspendidos?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  semestres_totales_carrera?: number;

  @IsString()
  @IsOptional()
  generacion?: string;

  @IsInt()
  @IsOptional()
  numero_carrera?: number;

  @IsString()
  @IsOptional()
  updated_by?: string;
}
