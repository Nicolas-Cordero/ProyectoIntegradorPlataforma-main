import { OmitType } from '@nestjs/mapped-types';
import { CreateRamoDto } from './create-ramo.dto';

export class CreateRamoMeDto extends OmitType(CreateRamoDto, [
  'rut_estudiante',
] as const) {}
