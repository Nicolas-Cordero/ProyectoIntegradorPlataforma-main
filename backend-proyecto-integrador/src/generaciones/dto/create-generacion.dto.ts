import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateGeneracionDto {
  @IsInt()
  @Min(1990)
  @Max(2100)
  año!: number;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
