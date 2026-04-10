import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UpdateRamosCursadosDto {
  @Expose()
  @IsNumber()
  @IsOptional()
  semestre?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  año?: number;

  @Expose()
  @IsString()
  @IsOptional()
  codigo_ramo?: string;

  @Expose()
  @IsString()
  @IsOptional()
  nivel_educativo?: string;

  @Expose()
  @IsString()
  @IsOptional()
  nombre_ramo?: string;

  @Expose()
  @IsOptional()
  notas_parciales?: any;

  @Expose()
  @IsNumber()
  @IsOptional()
  promedio_final?: number;

  @Expose()
  @IsString()
  @IsOptional()
  estado?: string;

  @Expose()
  @IsString()
  @IsOptional()
  comentarios?: string;

  @Expose()
  @IsNumber()
  @IsOptional()
  oportunidad?: number;

  @Expose()
  @IsString()
  @IsOptional()
  periodo_academico_estudiante_id?: string;
}
