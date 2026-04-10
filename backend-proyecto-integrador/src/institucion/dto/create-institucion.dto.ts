import { IsString, IsOptional } from 'class-validator';

export class CreateInstitucionDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  tipo_institucion?: string;

  @IsOptional()
  @IsString()
  nivel_educativo?: string;

  @IsOptional()
  @IsString()
  carrera_especialidad?: string;

  @IsOptional()
  @IsString()
  duracion?: string;

  @IsOptional()
  @IsString()
  anio_de_ingreso?: string;

  @IsOptional()
  @IsString()
  anio_de_egreso?: string;
}
