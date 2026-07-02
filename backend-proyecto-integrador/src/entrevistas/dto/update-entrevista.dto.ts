import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateEntrevistaDto } from './create-entrevista.dto';

export class UpdateEntrevistaDto extends PartialType(
  PickType(CreateEntrevistaDto, [
    'fecha_hora',
    'duracion_s',
    'resumen',
  ] as const),
) {}
