import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { semestre } from '@prisma/client';
import { CreateSemestreDto } from './dto/create-semestre.dto';
import { SemestreRepository } from './semestre.repository';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class SemestreService {
  constructor(
    private readonly semestreRepository: SemestreRepository,
    private readonly storageService: StorageService,
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

  // Solo el estudiante dueño de la carrera puede subir el certificado de ese
  // semestre — un solo documento por carrera+semestre, no uno por ramo.
  async uploadCertificado(
    semestre_id: number,
    codigo_carrera: number,
    rut_estudiante: string,
    file: Express.Multer.File,
  ) {
    const dueño = await this.semestreRepository.findCarreraRut(codigo_carrera);
    if (!dueño) {
      throw new NotFoundException(
        `Carrera ${codigo_carrera} no encontrada`,
      );
    }
    if (dueño !== rut_estudiante) {
      throw new ForbiddenException(
        'No puedes subir un certificado a una carrera que no te pertenece',
      );
    }
    const { url } = await this.storageService.uploadPDF(file, 'certificados');
    return this.semestreRepository.updateCertificado(
      semestre_id,
      codigo_carrera,
      url,
    );
  }
}
