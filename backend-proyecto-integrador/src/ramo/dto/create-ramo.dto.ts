import { EstadoRamo } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateRamoDto {

  @Type(()=> Number)
  @IsNotEmpty()
  semestre_id!: number;

  @IsString()
  @IsNotEmpty()
  rut_estudiante!: string;

  @Type(()=> Number)
  @IsNotEmpty()
  codigo_carrera!: number;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEnum(EstadoRamo)
  @IsNotEmpty()
  estado!: EstadoRamo;

  @IsString()
  @IsNotEmpty()
  comentario!: string;

  @Type(()=> Number)
  @IsNotEmpty()
  intento!: number;
}
