import { ForbiddenException, Injectable } from '@nestjs/common';
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

  // Un semestre es un concepto de calendario compartido por ramos y
  // entrevistas de potencialmente muchos estudiantes distintos, y por
  // semestre_carrera de muchas carreras. No se puede eliminar bajo ninguna
  // circunstancia — evita que un borrado accidental arrastre datos
  // académicos de estudiantes no relacionados con la acción.
  remove(): never {
    throw new ForbiddenException('Los semestres no se pueden eliminar.');
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

  cerrarSemestre(semestre_id: number, codigo_carrera: number): Promise<void> {
    return this.semestreRepository.cerrarSemestre(semestre_id, codigo_carrera);
  }
}
