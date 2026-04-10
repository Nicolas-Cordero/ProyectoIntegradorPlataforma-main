import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { TipoEstudiante } from '../entities/estudiante.entity';

export class CreateEstudianteDto {
  // CAMPOS OBLIGATORIOS
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  rut: string;

  @IsDateString()
  fecha_de_nacimiento: string;

  @IsEnum(TipoEstudiante)
  tipo_de_estudiante: TipoEstudiante;

  // CAMPOS OPCIONALES
  @IsOptional()
  @IsString()
  genero?: string;

  @IsOptional()
  @IsString()
  generacion?: string;

  @IsOptional()
  @IsUUID()
  id_institucion?: string;

  @IsOptional()
  @IsNumber()
  numero_carrera?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  // CAMPOS DE CONTACTO (opcionales, se crearán en informacion_contacto)
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  foto_url?: string;

}
