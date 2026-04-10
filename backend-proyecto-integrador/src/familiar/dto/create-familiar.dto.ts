import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFamiliarDto {
  @IsUUID()
  @IsNotEmpty()
  estudiante_id: string;

  @IsUUID()
  @IsNotEmpty()
  tipo_familiar_id: string;

  @IsString()
  @IsOptional()
  nombres: string;

  @IsString()
  @IsOptional()
  ocupacion?: string;

  @IsString()
  @IsOptional()
  nivel_educacional?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
