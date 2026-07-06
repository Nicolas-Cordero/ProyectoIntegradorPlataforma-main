import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TopicoAcuerdoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsArray()
  @IsString({ each: true })
  puntos!: string[];
}

export class CreatePdfAcuerdoDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsString()
  @IsNotEmpty()
  subtitulo!: string;

  @IsString()
  @IsNotEmpty()
  abstract!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicoAcuerdoDto)
  topicos!: TopicoAcuerdoDto[];

  @IsString()
  @IsNotEmpty()
  version!: string;
}
