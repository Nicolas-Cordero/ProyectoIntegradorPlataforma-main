import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type} from 'class-transformer';
import { Topico } from '@prisma/client';



export class CreateComentarioDto {

  @IsDate()
  @Type(() => Date)
  fecha_entrevista!: Date;

  @IsString()
  @IsNotEmpty()
  rut_estudiante!: string;


  @IsEnum(Topico)
  @IsNotEmpty()
  topico!: Topico;


  //Será necesario ponerle limite a cada comentario?
  @IsString()
  @IsNotEmpty()
  texto!:string;
}




export class CreateEntrevistaDto {
  @IsString()
  @IsNotEmpty()
  rut_estudiante!: string;

  @IsString()
  @IsNotEmpty()
  rut_entrevistador!: string;

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
