import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePeriodoAcademicoDto {
  @IsInt()
  @Min(1900)
  @Max(2100)
  @IsNotEmpty()
  año: number;

  @IsInt()
  @Min(1)
  @Max(2)
  @IsNotEmpty()
  semestre: number;

  @IsDateString()
  @IsOptional()
  fecha_inicio?: Date;

  @IsDateString()
  @IsOptional()
  fecha_fin?: Date;

  @IsBoolean()
  @IsOptional()
  es_actual?: boolean;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
