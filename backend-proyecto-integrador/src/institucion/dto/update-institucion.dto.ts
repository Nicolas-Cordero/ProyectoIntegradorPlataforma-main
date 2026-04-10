import { IsString, IsOptional, MinLength } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UpdateInstitucionDto {
  @Expose()
  @IsString()
  @IsOptional()
  @MinLength(2)
  nombre?: string;

  @Expose()
  @IsString()
  @IsOptional()
  tipo_institucion?: string;

  @Expose()
  @IsString()
  @IsOptional()
  nivel_educativo?: string;

  @Expose()
  @IsString()
  @IsOptional()
  carrera_especialidad?: string;

  @Expose()
  @IsString()
  @IsOptional()
  duracion?: string;

  @Expose()
  @IsString()
  @IsOptional()
  anio_de_ingreso?: string;

  @Expose()
  @IsString()
  @IsOptional()
  anio_de_egreso?: string;
}
