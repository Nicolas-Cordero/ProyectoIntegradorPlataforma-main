import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoBeneficio } from '@prisma/client';
import { Beneficios } from '../beneficios.enum';

export class CreateBeneficioDto {
  @IsEnum(Beneficios)
  @IsNotEmpty()
  nombre!: Beneficios;

  @IsEnum(TipoBeneficio)
  @IsNotEmpty()
  tipo!: TipoBeneficio;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  monto!: number;

  @IsString()
  @IsNotEmpty()
  proveedor!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;
}
