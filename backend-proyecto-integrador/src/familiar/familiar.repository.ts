import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, familiar } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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
    try {
      return await this.prisma.familiar.delete({
        where: {
          id: id_familiar,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'No se puede eliminar: este familiar está registrado como contacto de emergencia. Quítalo de esa asignación primero.',
        );
      }
      throw error;
    }
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
