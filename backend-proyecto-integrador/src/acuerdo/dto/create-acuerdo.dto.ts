import { Type } from 'class-transformer';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';

export class TopicoDto {
  @IsOptional()
  @IsString()
  nombre!: string | null;

  @IsArray()
  @IsString({ each: true })
  puntos!: string[];
}

export class DocumentoCompromisoDto {
  @IsString()
  titulo!: string;

  @IsString()
  subtitulo!: string;

  @IsString()
  abstract!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicoDto)
  topicos!: TopicoDto[];
}

export class CreateAcuerdoDto {
  @ValidateNested()
  @Type(() => DocumentoCompromisoDto)
  documento!: DocumentoCompromisoDto;
}
