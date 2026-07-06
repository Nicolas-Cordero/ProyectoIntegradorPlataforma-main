import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePdfSemestreDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  codigo_carrera!: number;

  // Si se omite, el informe cubre todos los semestres de la carrera, uno
  // debajo del otro, en vez de uno solo.
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  semestre_id?: number;
}
