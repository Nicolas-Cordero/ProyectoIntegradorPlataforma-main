import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  // Comentario general de la entrevista: uno solo, ya sin tópicos. Se omite si
  // la entrevista se cerró sin anotaciones.
  @IsString()
  @IsOptional()
  @MaxLength(20000, {
    message: 'El comentario no puede superar los 20.000 caracteres',
  })
  comentario?: string;
}
