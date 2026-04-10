import { PartialType } from '@nestjs/mapped-types';
import { CreateBeneficioEstudianteDto } from './create-beneficio-estudiante.dto';

export class UpdateBeneficioEstudianteDto extends PartialType(CreateBeneficioEstudianteDto) {}
