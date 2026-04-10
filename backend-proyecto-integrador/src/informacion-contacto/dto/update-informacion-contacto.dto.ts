import { PartialType } from '@nestjs/mapped-types';
import { CreateInformacionContactoDto } from './create-informacion-contacto.dto';
import { IsUUID, IsOptional } from 'class-validator';

export class UpdateInformacionContactoDto extends PartialType(CreateInformacionContactoDto) {
  @IsUUID()
  @IsOptional()
  estudiante_id?: string;
}
