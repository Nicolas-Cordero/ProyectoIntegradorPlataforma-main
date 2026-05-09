import { PartialType } from '@nestjs/mapped-types';
import { CreateLiceoDto } from './create-liceo.dto';

export class UpdateLiceoDto extends PartialType(CreateLiceoDto) {}
