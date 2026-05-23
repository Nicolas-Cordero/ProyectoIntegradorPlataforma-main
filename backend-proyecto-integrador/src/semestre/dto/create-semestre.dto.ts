import { TipoSemestre } from "@prisma/client";
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty } from "class-validator";
import { Semestre } from "../semestre.enum";

export class CreateSemestreDto {
  @Type(() => Number)
  @IsNotEmpty()
  year!: number;

  @IsNotEmpty()
  @IsEnum(Semestre)
  semestre!: Semestre;

  @IsNotEmpty()
  @IsEnum(TipoSemestre)
  tipo!: TipoSemestre;
}
