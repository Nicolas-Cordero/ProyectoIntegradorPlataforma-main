import { PartialType } from '@nestjs/mapped-types';
import { CreateGeneracionDto } from './create-generacion.dto';

export class UpdateGeneracionDto extends PartialType(CreateGeneracionDto) {}
