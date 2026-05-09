import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateEstudianteDto } from './create-estudiante.dto';

export class UpdateEstudianteDto extends PartialType(
  PickType(CreateEstudianteDto, 
    [
      'nombre',
      'apellido',
      'email',
      'telefono',
      'generacion',
      'fecha_nacimiento',
      'direccion',
      'genero',
      'rbd_liceo',
      'puntaje_paes',
      'foto_url',
      'promedios_media',
      'estado'
    ])) {}
