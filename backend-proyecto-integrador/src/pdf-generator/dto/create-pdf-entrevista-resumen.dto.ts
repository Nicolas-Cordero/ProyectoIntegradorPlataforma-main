import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePdfEntrevistaResumenDto {
  @IsString()
  @IsNotEmpty()
  rut_estudiante: string;

  @IsString()
  @IsNotEmpty()
  nombre_estudiante: string;
}
