import { PartialType } from '@nestjs/mapped-types';
import { CreatePeriodoAcademicoEstudianteDto } from './create-periodo-academico-estudiante.dto';

export class UpdatePeriodoAcademicoEstudianteDto extends PartialType(CreatePeriodoAcademicoEstudianteDto) {}
