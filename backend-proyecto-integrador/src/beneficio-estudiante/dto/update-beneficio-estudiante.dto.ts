
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoBeneficio } from '@prisma/client';

export class UpdateBeneficioEstudianteDto {
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  inicio?: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  fin?: Date;

  @IsEnum(EstadoBeneficio)
  @IsOptional()
  estado?: EstadoBeneficio;
}
