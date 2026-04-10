import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { TipoFamiliarCodigo } from '../entities/tipo-familiar.entity';

export class CreateTipoFamiliarDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEnum(TipoFamiliarCodigo)
  @IsNotEmpty()
  codigo: TipoFamiliarCodigo;

  @IsInt()
  orden: number;
}
