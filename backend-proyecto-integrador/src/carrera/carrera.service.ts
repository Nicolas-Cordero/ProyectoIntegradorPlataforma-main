import { Injectable } from '@nestjs/common';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';
import { CarreraRepository } from './carrera.repository';
import { HistorialEstadoCarreraService } from '../historial-estado-carrera';
import { carrera } from '@prisma/client';

@Injectable()
export class CarreraService {
  constructor(
    private readonly carreraRepo: CarreraRepository,
    private readonly historialService: HistorialEstadoCarreraService,
  ) {}

  async create(createCarreraDto: CreateCarreraDto, rut_usuario: string): Promise<carrera> {
    const carrera = await this.carreraRepo.create(createCarreraDto);
    await this.historialService.registrarEstadoInicial(carrera.codigo_carrera, rut_usuario);
    return carrera;
  }

  findByEstudiante(rut_estudiante: string): Promise<carrera[]> {
    return this.carreraRepo.findAllByEstudiante(rut_estudiante);
  }

  async findOne(codigo_carrera: number): Promise<carrera> {
    const carrera = await this.carreraRepo.findOne(codigo_carrera);
    if (!carrera) throw new Error('No se encontro ninguna carrera');
    return carrera;
  }

  update(codigo_carrera: number, updateCarreraDto: UpdateCarreraDto): Promise<carrera> {
    return this.carreraRepo.update(codigo_carrera, updateCarreraDto);
  }

  remove(codigo_carrera: number) {
    return this.carreraRepo.remove(codigo_carrera);
  }
}
