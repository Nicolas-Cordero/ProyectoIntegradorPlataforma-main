import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsDateString,
  IsOptional,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Exclude, Expose } from 'class-transformer';

export class TextoEtiquetaDto {
  @IsString()
  @IsNotEmpty()
  contenido: string;

  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsOptional()
  contexto?: string;
}

export class EtiquetaDto {
  @IsString()
  @IsNotEmpty()
  nombre_etiqueta: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TextoEtiquetaDto)
  textos: TextoEtiquetaDto[];
}

export class CreateEntrevistaDto {
  @IsString()
  @IsNotEmpty()
  id_estudiante: string;

  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  nombre_tutor: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(2020)
  año: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  numero_entrevista: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(15)
  @Max(180)
  duracion_minutos: number;

  @IsString()
  @IsNotEmpty()
  estado: 'programada' | 'completada' | 'cancelada' | 'reprogramada';

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  informacion_adicional?: string;

  @IsArray()
  @IsString({ each: true })
  temas_abordados: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EtiquetaDto)
  @IsOptional()
  etiquetas?: EtiquetaDto[];
}
