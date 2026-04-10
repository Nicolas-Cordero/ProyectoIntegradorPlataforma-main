import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadoAcademicoDto } from './create-estado-academico.dto';
import { IsUUID, IsOptional } from 'class-validator';

export class UpdateEstadoAcademicoDto extends PartialType(CreateEstadoAcademicoDto) {
  @IsUUID()
  @IsOptional()
  estudiante_id?: string;
}
