import { EstadoEstudiante } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export class CreateHistorialEstadoCarreraDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  codigo_carrera!: number;

  @IsEnum(EstadoEstudiante)
  @IsNotEmpty()
  estado_nuevo!: EstadoEstudiante;
}
