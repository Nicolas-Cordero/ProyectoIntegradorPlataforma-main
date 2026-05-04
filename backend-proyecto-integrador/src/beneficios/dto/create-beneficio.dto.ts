import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { TipoBeneficio } from '..';
import { Type } from 'class-transformer';

export class CreateBeneficioDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEnum(TipoBeneficio)
  @IsNotEmpty()
  tipo!: TipoBeneficio;

  @Type(()=>Number)
  @IsNumber()
  @IsNotEmpty()
  monto!: string;

  @IsString()
  @IsNotEmpty()
  proveedor!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

}
