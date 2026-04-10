import { PartialType } from '@nestjs/mapped-types';
import { CreateInformacionAdmisionDto } from './create-informacion-admision.dto';

export class UpdateInformacionAdmisionDto extends PartialType(CreateInformacionAdmisionDto) {}
