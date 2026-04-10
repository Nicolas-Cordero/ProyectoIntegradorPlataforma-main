import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateBeneficioEstudianteDto {
  @IsUUID()
  @IsNotEmpty()
  estudiante_id: string;

  @IsUUID()
  @IsNotEmpty()
  beneficio_id: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  @IsNotEmpty()
  año_inicio: number;

  @IsInt()
  @Min(1900)
  @Max(2100)
  @IsOptional()
  año_termino?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
