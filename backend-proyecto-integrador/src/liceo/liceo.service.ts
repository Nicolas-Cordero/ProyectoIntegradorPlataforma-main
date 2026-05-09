import { Injectable } from '@nestjs/common';
import { CreateLiceoDto } from './dto/create-liceo.dto';
import { UpdateLiceoDto } from './dto/update-liceo.dto';

@Injectable()
export class LiceoService {
  create(createLiceoDto: CreateLiceoDto) {
    return 'This action adds a new liceo';
  }

  findAll() {
    return `This action returns all liceo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} liceo`;
  }

  update(id: number, updateLiceoDto: UpdateLiceoDto) {
    return `This action updates a #${id} liceo`;
  }

  remove(id: number) {
    return `This action removes a #${id} liceo`;
  }
}
