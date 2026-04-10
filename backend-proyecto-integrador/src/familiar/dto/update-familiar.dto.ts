import { PartialType } from '@nestjs/mapped-types';
import { CreateFamiliarDto } from './create-familiar.dto';

export class UpdateFamiliarDto extends PartialType(CreateFamiliarDto) {}
