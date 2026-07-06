import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreatePdfAcademicoDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  codigo_carrera!: number;
}
