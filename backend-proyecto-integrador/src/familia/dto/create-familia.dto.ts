import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateFamiliaDto {
  @IsString()
  @IsNotEmpty()
  id_estudiante: string;

  @IsOptional()
  @IsString()
  nombre_madre?: string;

  @IsOptional()
  @IsArray()
  descripcion_madre?: string[];

  @IsOptional()
  @IsString()
  nombre_padre?: string;

  @IsOptional()
  @IsArray()
  descripcion_padre?: string[];

  @IsOptional()
  @IsArray()
  hermanos?: any[];

  @IsOptional()
  @IsArray()
  otros_familiares?: any[];

  @IsOptional()
  @IsString()
  observaciones_hermanos?: string;

  @IsOptional()
  @IsString()
  observaciones_otros_familiares?: string;

  @IsOptional()
  observaciones?: any;
}
