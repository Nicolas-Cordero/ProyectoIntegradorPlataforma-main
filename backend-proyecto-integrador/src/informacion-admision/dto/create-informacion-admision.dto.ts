import { IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateInformacionAdmisionDto {
  @IsUUID()
  @IsNotEmpty()
  estudiante_id: string;

  @IsString()
  @IsOptional()
  via_acceso?: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  @IsOptional()
  año_ingreso?: number;

  @IsString()
  @IsOptional()
  colegio?: string;

  @IsString()
  @IsOptional()
  especialidad_colegio?: string;

  @IsString()
  @IsOptional()
  comuna_colegio?: string;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsOptional()
  puntaje_nem?: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsOptional()
  puntaje_ranking?: number;

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

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsOptional()
  puntaje_ponderado?: number;

  @IsObject()
  @IsOptional()
  otros_puntajes?: any;
}
