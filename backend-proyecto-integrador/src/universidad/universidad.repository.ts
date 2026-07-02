import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUniversidadDto } from './dto/create-universidad.dto';
import { UpdateUniversidadDto } from './dto/update-universidad.dto';
import { universidad } from '@prisma/client';

@Injectable()
export class UniversidadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    cretaeUniversidadDto: CreateUniversidadDto,
  ): Promise<universidad> {
    return this.prisma.universidad.create({
      data: cretaeUniversidadDto,
    });
  }

  async update(
    id_universidad: number,
    updateUniversidadDto: UpdateUniversidadDto,
  ): Promise<universidad> {
    return this.prisma.universidad.update({
      where: {
        codigo_universidad: id_universidad,
      },
      data: updateUniversidadDto,
    });
  }

  async remove(id_universidad: number): Promise<universidad> {
    return this.prisma.universidad.delete({
      where: {
        codigo_universidad: id_universidad,
      },
    });
  }

  async findAll(): Promise<universidad[]> {
    return this.prisma.universidad.findMany();
  }

  async findOne(id_universidad: number): Promise<universidad | null> {
    return this.prisma.universidad.findUnique({
      where: {
        codigo_universidad: id_universidad,
      },
    });
  }

  async findByComuna(comuna: string): Promise<universidad[]> {
    return this.prisma.universidad.findMany({
      where: {
        comuna: comuna,
      },
    });
  }

  async findByEstudiante(rut_estudiante: string): Promise<universidad[]> {
    return this.prisma.universidad.findMany({
      where: {
        carreras: {
          some: {
            rut_estudiante: rut_estudiante,
          },
        },
      },
    });
  }
}
