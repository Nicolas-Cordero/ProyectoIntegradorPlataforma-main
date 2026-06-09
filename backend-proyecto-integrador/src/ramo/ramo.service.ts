import { Injectable } from '@nestjs/common';
import { CreateRamoDto } from './dto/create-ramo.dto';
import { UpdateRamoDto } from './dto/update-ramo.dto';
import { RamoRepository, RamoConDetalle } from './ramo.repository';
import { ramo } from '@prisma/client';

@Injectable()
export class RamoService {
  constructor(
    private readonly ramoRepository: RamoRepository,
  ){}



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
}
