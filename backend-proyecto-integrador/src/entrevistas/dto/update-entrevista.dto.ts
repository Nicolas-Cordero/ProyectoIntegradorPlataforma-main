import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  ValidateNested,
  Min,
  Max,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Exclude, Expose } from 'class-transformer';

export class UpdateTextoEtiquetaDto {
  @Expose()
  @IsString()
  @IsOptional()
  contenido?: string;

  @Expose()
  @IsDateString()
  @IsOptional()
  fecha?: string;

  @Expose()
  @IsString()
  @IsOptional()
  contexto?: string;
}

export class UpdateEtiquetaDto {
  @Expose()
  @IsString()
  @IsOptional()
  nombre_etiqueta?: string;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTextoEtiquetaDto)
  @IsOptional()
  textos?: UpdateTextoEtiquetaDto[];
}

@Exclude()
export class UpdateEntrevistaDto {
  @Expose()
  @IsDateString()
  @IsOptional()
  fecha?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @Min(2)
  nombre_tutor?: string;

  @Expose()
  @IsNumber()
  @IsOptional()
  @Min(2020)
  @Max(2030)
  año?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  @Min(1)
  numero_entrevista?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  @Min(15)
  @Max(180)
  duracion_minutos?: number;

  @Expose()
  @IsString()
  @IsOptional()
  @IsEnum(['programada', 'completada', 'cancelada', 'reprogramada'])
  estado?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @Min(10)
  observaciones?: string;

  @Expose()
  @IsString()
  @IsOptional()
  informacion_adicional?: string;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @IsNotEmpty({ each: true })
  @Min(1, { each: true })
  temas_abordados?: string[];

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEtiquetaDto)
  @IsOptional()
  etiquetas?: UpdateEtiquetaDto[];
}
