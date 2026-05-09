import { ViaAcceso } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCarreraDto {

  @IsNotEmpty()
  @IsString()
  nombre!: string;
  
  @IsNotEmpty()
  @IsString()
  rut_estudiante!: string;

  @Type(()=>Number)
  @IsInt()
  @IsNotEmpty()
  duracion_sem!: number;

  @Type(()=>Number)
  @IsInt()
  @IsNotEmpty()
  codigo_universidad!: number;

  @IsEnum(ViaAcceso)
  @IsNotEmpty()
  via_acceso!: ViaAcceso;
}
