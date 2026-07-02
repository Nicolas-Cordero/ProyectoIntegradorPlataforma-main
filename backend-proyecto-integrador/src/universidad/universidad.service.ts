import { Injectable } from '@nestjs/common';
import { CreateUniversidadDto } from './dto/create-universidad.dto';
import { UpdateUniversidadDto } from './dto/update-universidad.dto';
import { UniversidadRepository } from './universidad.repository';
import { universidad } from '@prisma/client';

@Injectable()
export class UniversidadService {
  constructor(private readonly universidadRepo: UniversidadRepository) {}

  create(createUniversidadDto: CreateUniversidadDto): Promise<universidad> {
    return this.universidadRepo.create(createUniversidadDto);
  }

  findAll(): Promise<universidad[]> {
    return this.universidadRepo.findAll();
  }

  async findOne(id_universidad: number): Promise<universidad> {
    const universidad = await this.universidadRepo.findOne(id_universidad);
    if (!universidad) {
      throw new Error(`Universidad con id ${id_universidad} no encontrada`);
    }
    return universidad;
  }

  findByComuna(comuna: string): Promise<universidad[]> {
    return this.universidadRepo.findByComuna(comuna);
  }

  findByEstudiante(rut_estudiante: string): Promise<universidad[]> {
    return this.universidadRepo.findByEstudiante(rut_estudiante);
  }

  update(
    id_universidad: number,
    updateUniversidadDto: UpdateUniversidadDto,
  ): Promise<universidad> {
    return this.universidadRepo.update(id_universidad, updateUniversidadDto);
  }

  remove(id_universidad: number): Promise<universidad> {
    //Las universidades son independientes, pero no tiene sentido eliminar ninguna.
    return this.universidadRepo.remove(id_universidad);
  }
}
