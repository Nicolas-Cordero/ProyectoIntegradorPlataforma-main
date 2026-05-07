import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Type} from 'class-transformer';



export class CreateEntrevistaDto {
  @IsString()
  @IsNotEmpty()
  rut_estudiante!: string;

  @IsString()
  @IsNotEmpty()
  rut_entrevistador!: string;

  @IsDate()
  @Type(() => Date)
  fecha_hora!: Date;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  semestre_id!: number;


  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  duracion_s!: number;


  @IsString()
  @IsOptional()
  resumen?: string;
}
