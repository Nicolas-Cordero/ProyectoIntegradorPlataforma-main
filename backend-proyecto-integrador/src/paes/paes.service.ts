import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaesDto } from './dto/create-paes.dto';
import { UpdatePaesDto } from './dto/update-paes.dto';
import { PaesRepository } from './paes.repository';

@Injectable()
export class PaesService {
  constructor(private readonly paesRepo: PaesRepository) {}

  async create(createPaesDto: CreatePaesDto) {
    const existing = await this.paesRepo.findPaesByEstudiante(createPaesDto.rut_estudiante);
    if (existing) {
      throw new ConflictException(`El estudiante ${createPaesDto.rut_estudiante} ya tiene PAES registrada`);
    }
    return this.paesRepo.create(createPaesDto);
  }

  async findAll() {
    return this.paesRepo.findAll();
  }

  async findByEstudiante(rut_estudiante: string) {
    const existing = await this.paesRepo.findPaesByEstudiante(rut_estudiante);
    if (!existing) {
      throw new NotFoundException(`No se encontró PAES para el estudiante ${rut_estudiante}`);
    }
    return existing;
  }

  async update(rut_estudiante: string, updatePaesDto: UpdatePaesDto) {
    const existing = await this.paesRepo.findPaesByEstudiante(rut_estudiante);
    if (!existing) {
      throw new NotFoundException(`No se encontró PAES para el estudiante ${rut_estudiante}`);
    }
    return this.paesRepo.update(rut_estudiante, updatePaesDto);
  }

  async getByGeneration(generacion: string) {
    const estudiantes = await this.paesRepo.findAllEstudiantes();
    const allPaes = await this.paesRepo.findAll();

    const rutsInGeneration = new Set(
      estudiantes
        .filter(e => e.generacion === generacion)
        .map(e => e.rut_estudiante),
    );

    return allPaes.filter(p => rutsInGeneration.has(p.rut_estudiante));
  }

  async removeByEstudiante(rut_estudiante: string): Promise<void> {
    const existing = await this.paesRepo.findPaesByEstudiante(rut_estudiante);
    if (!existing) {
      throw new NotFoundException(`No se encontró PAES para el estudiante ${rut_estudiante}`);
    }
    await this.paesRepo.remove(existing.id);
  }
}
