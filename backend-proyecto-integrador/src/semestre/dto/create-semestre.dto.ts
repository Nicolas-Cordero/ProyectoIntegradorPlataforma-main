import { TipoSemestre } from "@prisma/client";
import { Type } from "class-transformer/types/decorators/type.decorator";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateSemestreDto {
  @Type(() => Number)
  @IsNotEmpty()
  year!: number;

  @IsNotEmpty()
  @IsString()
  semestre!: string;

  @IsNotEmpty()
  @IsEnum(TipoSemestre)
  tipo!: TipoSemestre;
}
