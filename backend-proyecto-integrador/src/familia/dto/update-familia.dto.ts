import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UpdateFamiliaDto {
  @Expose()
  @IsString()
  @IsOptional()
  nombre_madre?: string;

  @Expose()
  @IsArray()
  @IsOptional()
  descripcion_madre?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  nombre_padre?: string;

  @Expose()
  @IsArray()
  @IsOptional()
  descripcion_padre?: string[];

  @Expose()
  @IsArray()
  @IsOptional()
  hermanos?: any[];

  @Expose()
  @IsArray()
  @IsOptional()
  otros_familiares?: any[];

  @Expose()
  @IsString()
  @IsOptional()
  observaciones_hermanos?: string;

  @Expose()
  @IsString()
  @IsOptional()
  observaciones_otros_familiares?: string;

  @Expose()
  @IsOptional()
  observaciones?: any;
}
