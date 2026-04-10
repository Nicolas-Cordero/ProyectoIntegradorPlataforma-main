import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateInformacionContactoDto {
  @IsUUID()
  @IsNotEmpty()
  estudiante_id: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  comuna?: string;

  @IsString()
  @IsOptional()
  region?: string;
}
