import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TipoBeneficio } from '@prisma/client';

export class CreateBeneficioDto {
  // El catálogo se carga desde el seeder (`src/seeder/data/beneficios.data.ts`),
  // no desde esta API: no hay una lista cerrada de nombres que validar.
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEnum(TipoBeneficio)
  @IsNotEmpty()
  tipo!: TipoBeneficio;

  @IsString()
  @IsNotEmpty()
  proveedor!: string;
}
