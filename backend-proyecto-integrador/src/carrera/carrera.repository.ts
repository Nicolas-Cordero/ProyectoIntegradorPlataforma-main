import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarreraDto, UpdateCarreraDto } from './dto';
import { carrera, ViaAcceso } from '@prisma/client';

@Injectable()
export class CarreraRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCarreraDto: CreateCarreraDto): Promise<carrera> {
    return this.prisma.carrera.create({
      data: createCarreraDto,
    });
  }

  async update(
    id_carrera: number,
    updateCarreraDto: UpdateCarreraDto,
  ): Promise<carrera> {
    return this.prisma.carrera.update({
      data: updateCarreraDto,
      where: {
        codigo_carrera: id_carrera,
      },
    });
  }

  async remove(id_carrera: number): Promise<carrera> {
    return this.prisma.carrera.delete({
      where: {
        codigo_carrera: id_carrera,
      },
    });
  }

  async findOne(id_carrera: number): Promise<carrera | null> {
    return this.prisma.carrera.findUnique({
      where: {
        codigo_carrera: id_carrera,
      },
    });
  }

  //esta si
  async findAllByEstudiante(rut_estudiante: string): Promise<carrera[]> {
    return this.prisma.carrera.findMany({
      where: {
        rut_estudiante: rut_estudiante,
      },
    });
  }

  //quiza no sea necesario
  async findAllByAcceso(via_acceso: ViaAcceso): Promise<carrera[]> {
    return this.prisma.carrera.findMany({
      where: {
        via_acceso: via_acceso,
      },
    });
  }

  // quiza no sea necesario
  async findAllByUniversidad(id_universidad: number): Promise<carrera[]> {
    return this.prisma.carrera.findMany({
      where: {
        codigo_universidad: id_universidad,
      },
    });
  }
}
