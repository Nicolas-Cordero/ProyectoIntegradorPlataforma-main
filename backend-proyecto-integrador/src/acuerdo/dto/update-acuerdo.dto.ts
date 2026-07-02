import { Type } from 'class-transformer';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';

export class UpdateTopicoDto {
  @IsOptional()
  @IsString()
  nombre?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  puntos?: string[];
}

export class UpdateDocumentoCompromisoDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  subtitulo?: string;

  @IsOptional()
  @IsString()
  abstract?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTopicoDto)
  topicos?: UpdateTopicoDto[];
}

export class UpdateAcuerdoDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDocumentoCompromisoDto)
  documento?: UpdateDocumentoCompromisoDto;
}
