import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreatePaesDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{7,8}-[\dkK]$/, {
    message: 'Formato de RUT inválido. Usa XXXXXXXX-D (ej: 12345678-9)',
  })
  rut_estudiante!: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  matematicas!: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  lenguaje!: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  nem!: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  ranking!: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  matematicas2?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  ciencias?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  historia?: number;
}
