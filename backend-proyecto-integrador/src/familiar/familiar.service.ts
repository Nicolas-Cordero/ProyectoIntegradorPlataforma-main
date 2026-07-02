import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateFamiliarDto, UpdateFamiliarDto } from './dto';
import { FamiliarRepository } from './familiar.repository';
import { familiar } from '@prisma/client';

@Injectable()
export class FamiliarService {
  constructor(private readonly familiarRepo: FamiliarRepository) {}

  // === FAMILIAR ===

  async create(createDto: CreateFamiliarDto): Promise<familiar> {
    if (createDto.es_contacto_emergencia) {
      const existing = await this.familiarRepo.findContactoEmergencia(
        createDto.rut_estudiante,
      );
      if (existing) {
        throw new ConflictException(
          'Ya existe un contacto de emergencia para este estudiante',
        );
      }
    }
    return this.familiarRepo.create(createDto);
  }

  async findOne(id_familiar: number): Promise<familiar> {
    const familiar = await this.familiarRepo.findFamiliar(id_familiar);
    if (!familiar) {
      throw new NotFoundException(
        `Familiar con ID ${id_familiar} no encontrado`,
      );
    }

    return familiar;
  }

  findByEstudiante(rut_estudiante: string): Promise<familiar[]> {
    return this.familiarRepo.findByEstudiante(rut_estudiante);
  }

  async update(
    id_familiar: number,
    updateDto: UpdateFamiliarDto,
  ): Promise<familiar> {
    if (updateDto.es_contacto_emergencia) {
      const current = await this.findOne(id_familiar);
      const existing = await this.familiarRepo.findContactoEmergencia(
        current.rut_estudiante,
        id_familiar,
      );
      if (existing) {
        throw new ConflictException(
          'Ya existe un contacto de emergencia para este estudiante',
        );
      }
    }
    return this.familiarRepo.update(id_familiar, updateDto);
  }

  remove(id_familiar: number): Promise<familiar> {
    //Verificar si hay que eliminar mas cosas.
    //cuando se elimine el alumno hay que eliminar todos los familiares asociados a ese alumno.
    return this.familiarRepo.remove(id_familiar);
  }
}
