import { Topico } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

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
  texto!: string;
}
