import { Injectable } from '@nestjs/common';
import { CreateSemestreDto } from './dto/create-semestre.dto';
import { SemestreRepository } from './semestre.repository';



@Injectable()
export class SemestreService {
  constructor(
    private readonly semestreRepository: SemestreRepository,
  ) {}

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
}
