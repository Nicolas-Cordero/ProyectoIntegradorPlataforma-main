import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Topico } from '@prisma/client';

export class ComentarioNestedDto {
  @IsEnum(Topico)
  topico!: Topico;

  @IsString()
  @IsNotEmpty()
  texto!: string;
}

export class CreateEntrevistaDto {
  @IsString()
  @IsNotEmpty()
  rut_estudiante!: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  fecha_hora?: Date;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  duracion_s!: number;

  @IsString()
  @IsOptional()
  resumen?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ComentarioNestedDto)
  comentarios?: ComentarioNestedDto[];
}
