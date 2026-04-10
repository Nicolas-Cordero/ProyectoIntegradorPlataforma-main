import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreatePeriodoAcademicoEstudianteDto {
  @IsUUID()
  @IsNotEmpty()
  estudiante_id: string;

  @IsUUID()
  @IsNotEmpty()
  periodo_academico_id: string;

  @IsUUID()
  @IsOptional()
  institucion_id?: string;

  @IsNumber()
  @Min(1.0)
  @Max(7.0)
  @IsOptional()
  promedio?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  creditos_aprobados?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  creditos_reprobados?: number;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
