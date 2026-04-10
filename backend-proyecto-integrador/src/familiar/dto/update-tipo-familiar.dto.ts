import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoFamiliarDto } from './create-tipo-familiar.dto';

export class UpdateTipoFamiliarDto extends PartialType(CreateTipoFamiliarDto) {}
