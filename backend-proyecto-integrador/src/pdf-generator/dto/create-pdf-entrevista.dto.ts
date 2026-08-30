import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePdfEntrevistaDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id_entrevista!: number;
}
