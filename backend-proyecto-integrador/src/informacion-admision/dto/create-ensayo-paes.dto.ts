import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateEnsayoPaesDto {
  @IsUUID()
  @IsNotEmpty()
  estudiante_id: string;

  @IsUUID()
  @IsOptional()
  admision_id?: string;

  @IsInt()
  @Min(2000)
  @Max(2100)
  @IsNotEmpty()
  año: number;

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  mes?: number;

  @IsString()
  @IsOptional()
  institucion?: string;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsOptional()
  puntaje_lenguaje?: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsOptional()
  puntaje_matematicas?: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsOptional()
  puntaje_ciencias?: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsOptional()
  puntaje_historia?: number;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
