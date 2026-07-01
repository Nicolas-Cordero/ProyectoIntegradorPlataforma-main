import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateFamiliarDto } from './create-familiar.dto';

export class UpdateFamiliarDto extends PartialType(
  PickType(CreateFamiliarDto, [
    'nombre',
    'telefono',
    'parentesco',
    'observacion',
    'es_contacto_emergencia',
  ])) {}
