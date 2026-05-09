import { Injectable } from '@nestjs/common';
import { CreateUniversidadDto } from './dto/create-universidad.dto';
import { UpdateUniversidadDto } from './dto/update-universidad.dto';

@Injectable()
export class UniversidadService {
  create(createUniversidadDto: CreateUniversidadDto) {
    return 'This action adds a new universidad';
  }

  findAll() {
    return `This action returns all universidad`;
  }

  findOne(id: number) {
    return `This action returns a #${id} universidad`;
  }

  update(id: number, updateUniversidadDto: UpdateUniversidadDto) {
    return `This action updates a #${id} universidad`;
  }

  remove(id: number) {
    return `This action removes a #${id} universidad`;
  }
}
