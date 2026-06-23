import { IsInt } from 'class-validator';

export class LinkCarreraDto {
  @IsInt() semestre_id: number;
  @IsInt() codigo_carrera: number;
}
