import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { GeneracionesRepository } from './generaciones.repository';
import { CreateGeneracionDto } from './dto/create-generacion.dto';
import { UpdateGeneracionDto } from './dto/update-generacion.dto';
import { generacion } from '@prisma/client';

@Injectable()
export class GeneracionesService {
  constructor(private readonly generacionesRepo: GeneracionesRepository) {}

  async getAll(): Promise<generacion[]> {
    return this.generacionesRepo.findAll();
  }

  async getById(id: number): Promise<generacion> {
    const gen = await this.generacionesRepo.findById(id);
    if (!gen) {
      throw new NotFoundException(`Generación con id ${id} no encontrada`);
    }
    return gen;
  }

  async getByAño(año: number): Promise<generacion> {
    const gen = await this.generacionesRepo.findByAño(año);
    if (!gen) {
      throw new NotFoundException(`Generación del año ${año} no encontrada`);
    }
    return gen;
  }

  async create(dto: CreateGeneracionDto): Promise<generacion> {
    const existing = await this.generacionesRepo.findByAño(dto.año);
    if (existing) {
      throw new ConflictException(
        `Ya existe una generación para el año ${dto.año}`,
      );
    }
    return this.generacionesRepo.create(dto);
  }

  async update(id: number, dto: UpdateGeneracionDto): Promise<generacion> {
    await this.getById(id);
    return this.generacionesRepo.update(id, dto);
  }

  async remove(id: number): Promise<generacion> {
    await this.getById(id);
    return this.generacionesRepo.delete(id);
  }
}
