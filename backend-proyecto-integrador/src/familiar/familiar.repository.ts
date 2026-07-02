import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { familiar } from '@prisma/client';
import { CreateFamiliarDto, UpdateFamiliarDto } from './dto';

@Injectable()
export class FamiliarRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFamiliarDto: CreateFamiliarDto) {
    return this.prisma.familiar.create({
      data: createFamiliarDto,
    });
  }

  async update(id_familiar: number, updateFamiliarDto: UpdateFamiliarDto) {
    return this.prisma.familiar.update({
      data: updateFamiliarDto,
      where: {
        id: id_familiar,
      },
    });
  }

  async remove(id_familiar: number) {
    return this.prisma.familiar.delete({
      where: {
        id: id_familiar,
      },
    });
  }

  async findFamiliar(id_familiar: number): Promise<familiar | null> {
    return this.prisma.familiar.findUnique({
      where: {
        id: id_familiar,
      },
    });
  }

  async findByEstudiante(rut_estudiante: string): Promise<familiar[]> {
    return this.prisma.familiar.findMany({
      where: {
        rut_estudiante: rut_estudiante,
      },
    });
  }

  async findContactoEmergencia(
    rut_estudiante: string,
    excludeId?: number,
  ): Promise<familiar | null> {
    return this.prisma.familiar.findFirst({
      where: {
        rut_estudiante,
        es_contacto_emergencia: true,
        ...(excludeId !== undefined ? { id: { not: excludeId } } : {}),
      },
    });
  }
}
