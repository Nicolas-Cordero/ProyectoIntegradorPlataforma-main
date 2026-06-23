import { Injectable } from '@nestjs/common';
import { semestre } from '@prisma/client';
import { CreateSemestreDto } from './dto/create-semestre.dto';
import { SemestreRepository } from './semestre.repository';

@Injectable()
export class SemestreService {
  constructor(private readonly semestreRepository: SemestreRepository) {}

  create(createSemestreDto: CreateSemestreDto) {
    return this.semestreRepository.create(createSemestreDto);
  }

  findAll() {
    return this.semestreRepository.findAll();
  }

  findOne(id: number) {
    return this.semestreRepository.findOne(id);
  }

  remove(id: number) {
    return this.semestreRepository.remove(id);
  }

  linkCarrera(semestre_id: number, codigo_carrera: number): Promise<void> {
    return this.semestreRepository.linkCarrera(semestre_id, codigo_carrera);
  }

  getByCarrera(codigo_carrera: number): Promise<semestre[]> {
    return this.semestreRepository.getByCarrera(codigo_carrera);
  }

  unlinkCarrera(semestre_id: number, codigo_carrera: number): Promise<void> {
    return this.semestreRepository.unlinkCarrera(semestre_id, codigo_carrera);
  }
}
