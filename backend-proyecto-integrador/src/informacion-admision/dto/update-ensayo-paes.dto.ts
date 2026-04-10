import { PartialType } from '@nestjs/mapped-types';
import { CreateEnsayoPaesDto } from './create-ensayo-paes.dto';

export class UpdateEnsayoPaesDto extends PartialType(CreateEnsayoPaesDto) {}
