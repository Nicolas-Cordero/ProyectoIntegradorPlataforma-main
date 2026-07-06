import { IsInt } from 'class-validator';

export class CerrarSemestreDto {
  @IsInt() semestre_id: number;
  @IsInt() codigo_carrera: number;
}
