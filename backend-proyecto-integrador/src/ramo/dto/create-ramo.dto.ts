import { EstadoRamo } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

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
  @IsOptional()
  comentario?: string;

  @Type(()=> Number)
  @IsOptional()
  intento?: number;

  @Type(()=> Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(7)
  @IsOptional()
  nota_final?: number;
}
