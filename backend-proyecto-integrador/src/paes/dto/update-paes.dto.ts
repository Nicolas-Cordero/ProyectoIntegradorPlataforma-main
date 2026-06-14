import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreatePaesDto } from './create-paes.dto';

export class UpdatePaesDto extends PartialType(PickType(CreatePaesDto,
    [
      'matematicas',
      'matematicas2',
      'lenguaje',
      'ciencias',
      'historia',
      'nem',
      'ranking'
    ])) {}
