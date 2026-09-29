import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateUniversidadDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;

  // Código Único Territorial de la comuna (catálogo `comuna`).
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  codigo_comuna!: number;
}
