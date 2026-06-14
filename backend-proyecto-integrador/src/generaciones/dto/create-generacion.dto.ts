import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateGeneracionDto {
  @Type(() => Number)
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(1990, { message: 'El año mínimo es 1990' })
  @Max(2100, { message: 'El año máximo es 2100' })
  año!: number;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
