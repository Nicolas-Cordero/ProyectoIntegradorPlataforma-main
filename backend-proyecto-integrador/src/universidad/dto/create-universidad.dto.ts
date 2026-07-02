import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUniversidadDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsNotEmpty()
  @IsString()
  comuna!: string;
}
