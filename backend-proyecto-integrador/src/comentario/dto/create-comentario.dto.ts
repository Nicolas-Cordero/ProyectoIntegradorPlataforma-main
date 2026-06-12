import { Topico } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class CreateComentarioDto {

  @Type(()=>Number)
  @IsNotEmpty()
  @IsNumber()
  entrevista_id!: number;

  @IsEnum(Topico)
  @IsNotEmpty()
  topico!: Topico;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'El comentario no puede superar los 2000 caracteres' })
  texto!: string;
}
