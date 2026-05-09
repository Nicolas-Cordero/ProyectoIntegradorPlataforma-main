import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateEntrevistaDto } from './create-entrevista.dto';



export class UpdateEntrevistaDto extends PartialType(
  PickType(CreateEntrevistaDto,
    [
      'duracion_s',
      'resumen',
    ]
  )) {}
