import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsNumber,
  IsDate,
  Matches,
  IsEmail,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
//import { TipoEstudiante } from hay que crear el enum en el schema
import { Type } from 'class-transformer';
import { EstadoEstudiante, Genero } from '@prisma/client';



export class CreateEstudianteDto {
  // CAMPOS OBLIGATORIOS
  @IsString()
  @IsNotEmpty()
  rut!: string;


  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  apellido!: string;


  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email!: string;


  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @Matches(/^\+569\s?\d{4}\s?\d{4}$/, {
    message: 'Formato inválido. Usa +569 xxxx xxxx o +569xxxxxxxx',
  })
  telefono!: string;


  @IsNotEmpty()
  @IsString()
  generacion!: string;


  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  fecha_de_nacimiento!: Date;


  @IsNotEmpty()
  @IsString()
  direccion!: string;


  @IsEnum(Genero)
  @IsNotEmpty()
  genero!: Genero;


  @IsString()
  @IsNotEmpty()
  rbd_liceo!: string;


  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  puntaje_paes?: number;


  @IsString()
  @IsOptional()
  foto_url!: string;


  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1.0)
  @Max(7.0)
  promedios_media!: number;


  @IsEnum(EstadoEstudiante)
  @IsNotEmpty()
  estado!: EstadoEstudiante;



  // @IsEnum(TipoEstudiante)
  // tipo_de_estudiante: TipoEstudiante;
}
