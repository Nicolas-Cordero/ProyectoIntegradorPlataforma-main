import { Injectable } from '@nestjs/common';
import { CreateInstitucionDto } from './dto/create-institucion.dto';
import { UpdateInstitucionDto } from './dto/update-institucion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Institucion } from './entities/institucion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InstitucionService {

  constructor(@InjectRepository(Institucion) private institucionRepository: Repository<Institucion>) {}

  async create(createInstitucionDto: CreateInstitucionDto) {
    const institucion = this.institucionRepository.create(createInstitucionDto);
    return await this.institucionRepository.save(institucion);
  }

  async findAll() {
    return await this.institucionRepository.find();
  }

  async findOne(id: string) {
    return await this.institucionRepository.findOne({ where: { id_institucion: id } });
  }

  async update(id: string, updateInstitucionDto: UpdateInstitucionDto) {
    await this.institucionRepository.update(id, updateInstitucionDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    return await this.institucionRepository.delete(id);
  }
}
