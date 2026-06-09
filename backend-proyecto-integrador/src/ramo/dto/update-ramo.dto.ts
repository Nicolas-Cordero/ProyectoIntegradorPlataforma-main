import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateRamoDto } from './create-ramo.dto';

export class UpdateRamoDto extends PartialType(
  PickType(CreateRamoDto, [
    'nombre',
    'estado',
    'comentario',
    'intento',
    'nota_final'
  ] as const) ){}
