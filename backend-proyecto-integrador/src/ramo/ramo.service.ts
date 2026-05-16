import { Injectable } from '@nestjs/common';
import { CreateRamoDto } from './dto/create-ramo.dto';
import { UpdateRamoDto } from './dto/update-ramo.dto';
import { RamoRepository } from './ramo.repository';
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



  async getNotaFinal(id_ramo: number): Promise<number> {
    const ramo = await this.ramoRepository.findOneWithNotas(id_ramo)
    if (!ramo) {
      throw new Error(`Ramo con id ${id_ramo} no encontrado`);
    }
    const notas = ramo.notas;
    if (notas.length === 0) {
      return 0; // o algún valor por defecto si no hay notas
    }
    const sumaNotas = notas.reduce((sum, nota) => sum + Number(nota.nota), 0);
    return sumaNotas / notas.length; // promedio de las notas 
  }



  async getNotas(id_ramo: number): Promise<number[]> {
    const ramo = await this.ramoRepository.findOneWithNotas(id_ramo)
    if (!ramo) {
      throw new Error(`Ramo con id ${id_ramo} no encontrado`);
    }
    const notas = ramo.notas.map(nota => Number(nota.nota));
    return notas;
  }




  update(id_ramo: number, updateRamoDto: UpdateRamoDto): Promise<ramo> {
    return this.ramoRepository.update(id_ramo, updateRamoDto);
  }

  remove(id: number): Promise<ramo> {
    //Al borrar un ramo hay que borrar tambien sus notas asociadas
    return this.ramoRepository.remove(id);
  }
}
