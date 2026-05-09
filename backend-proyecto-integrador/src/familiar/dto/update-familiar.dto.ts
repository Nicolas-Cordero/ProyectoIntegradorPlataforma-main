import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateFamiliarDto } from './create-familiar.dto';

export class UpdateFamiliarDto extends PartialType(
  PickType(CreateFamiliarDto, [
    'rut_familiar',
    'nombre',
    'telefono',
    'parentesco',
    'observacion'
  ])) {}
