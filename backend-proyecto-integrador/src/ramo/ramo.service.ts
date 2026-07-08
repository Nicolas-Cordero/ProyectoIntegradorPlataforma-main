import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRamoDto } from './dto/create-ramo.dto';
import { CreateRamoMeDto } from './dto/create-ramo-me.dto';
import { UpdateRamoDto } from './dto/update-ramo.dto';
import { RamoRepository, RamoConDetalle } from './ramo.repository';
import { ramo } from '@prisma/client';

@Injectable()
export class RamoService {
  constructor(private readonly ramoRepository: RamoRepository) {}

  create(createRamoDto: CreateRamoDto): Promise<ramo> {
    return this.ramoRepository.create(createRamoDto);
  }

  async findOne(id_ramo: number): Promise<ramo> {
    const ramo = await this.ramoRepository.findOne(id_ramo);
    if (!ramo) {
      throw new Error(`Ramo con id ${id_ramo} no encontrado`);
    }
    return ramo;
  }

  update(id_ramo: number, updateRamoDto: UpdateRamoDto): Promise<ramo> {
    return this.ramoRepository.update(id_ramo, updateRamoDto);
  }

  remove(id: number): Promise<ramo> {
    return this.ramoRepository.remove(id);
  }

  findAllByCarrera(codigo_carrera: number): Promise<RamoConDetalle[]> {
    return this.ramoRepository.findAllByCarrera(codigo_carrera);
  }

  // ── Operaciones propias del estudiante (el rut viene del JWT) ─────────────────

  findAllByEstudiante(rut_estudiante: string): Promise<ramo[]> {
    return this.ramoRepository.findAllByEstudiante(rut_estudiante);
  }

  // Fuerza el rut del estudiante autenticado: el body no incluye rut_estudiante.
  createForEstudiante(
    rut_estudiante: string,
    createRamoDto: CreateRamoMeDto,
  ): Promise<ramo> {
    return this.ramoRepository.create({ ...createRamoDto, rut_estudiante });
  }

  // Solo permite modificar un ramo que pertenece al estudiante autenticado.
  async updateOwn(
    id_ramo: number,
    rut_estudiante: string,
    updateRamoDto: UpdateRamoDto,
  ): Promise<ramo> {
    const ramo = await this.ramoRepository.findOne(id_ramo);
    if (!ramo) {
      throw new NotFoundException(`Ramo con id ${id_ramo} no encontrado`);
    }
    if (ramo.rut_estudiante !== rut_estudiante) {
      throw new ForbiddenException(
        'No puedes modificar un ramo que no te pertenece',
      );
    }
    return this.ramoRepository.update(id_ramo, updateRamoDto);
  }
}
