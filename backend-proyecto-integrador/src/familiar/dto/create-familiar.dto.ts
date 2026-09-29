import { Parentesco } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateFamiliarDto {
  @IsString()
  @IsNotEmpty()
  rut_estudiante!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  // Opcional: hay familiares sin número. Un string vacío se trata como "sin
  // teléfono" (null), que es también como se borra en un update. La exigencia
  // para el contacto de emergencia vive en FamiliarService.
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() === '' ? null : value,
  )
  @IsOptional()
  @Matches(/^\+569\s?\d{4}\s?\d{4}$/, {
    message: 'Formato inválido. Usa +569 xxxx xxxx o +569xxxxxxxx',
  })
  telefono?: string | null;

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
