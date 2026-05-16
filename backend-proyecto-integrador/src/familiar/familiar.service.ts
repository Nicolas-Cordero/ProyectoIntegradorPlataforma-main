import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import {
  CreateFamiliarDto,
  UpdateFamiliarDto,
} from './dto';
import { FamiliarRepository } from './familiar.repository';
import { familiar } from '@prisma/client';

@Injectable()
export class FamiliarService {
  constructor(
    private readonly familiarRepo: FamiliarRepository,
  ) {}

  // === FAMILIAR ===

  create(createDto: CreateFamiliarDto): Promise<familiar> {
    return this.familiarRepo.create(createDto); 
  }


  async findOne(id_familiar: number): Promise<familiar> {
    const familiar = await this.familiarRepo.findFamiliar(id_familiar);
    if (!familiar) {
      throw new NotFoundException(`Familiar con ID ${id_familiar} no encontrado`);
    }

    return familiar;
  }

  findByEstudiante(rut_estudiante: string): Promise<familiar[]> {
    return this.familiarRepo.findByEstudiante(rut_estudiante);
  }

  async update(id_familiar: number, updateDto: UpdateFamiliarDto): Promise<familiar> {
    return await this.familiarRepo.update(id_familiar, updateDto);
  }

  remove(id_familiar: number): Promise<familiar> {
    //Verificar si hay que eliminar mas cosas.
    //cuando se elimine el alumno hay que eliminar todos los familiares asociados a ese alumno.
    return this.familiarRepo.remove(id_familiar);
  }
}
