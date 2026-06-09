import { Parentesco } from '@prisma/client';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';


export class CreateFamiliarDto {
  @IsString()
  @IsNotEmpty()
  rut_estudiante!: string;


  @IsString()
  @IsNotEmpty()
  rut_familiar!: string;


  @IsString()
  @IsNotEmpty()
  nombre!: string;


  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @Matches(/^\+569\s?\d{4}\s?\d{4}$/, {
    message: 'Formato inválido. Usa +569 xxxx xxxx o +569xxxxxxxx',
  })
  telefono!: string;


  @IsNotEmpty()
  @IsEnum(Parentesco)
  parentesco!: Parentesco;

  
  @IsString()
  @IsOptional()
  observacion?: string;

  @IsBoolean()
  @IsOptional()
  es_contacto_emergencia?: boolean;
}
