import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUniversidadDto } from './create-universidad.dto';

export class UpdateUniversidadDto extends PartialType(
  PickType(CreateUniversidadDto,
    [
      'nombre',
      'comuna'
    ]
  )) {}
