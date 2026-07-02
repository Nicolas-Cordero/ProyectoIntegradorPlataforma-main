import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ramo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRamoDto, UpdateRamoDto } from './dto';

export type RamoConDetalle = ramo & {
  semestre: {
    semestre_id: number;
    year: number;
    semestre: string;
    tipo: string;
  };
};

@Injectable()
export class RamoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRamoDto: CreateRamoDto): Promise<ramo> {
    try {
      return await this.prisma.ramo.create({
        data: {
          ...createRamoDto,
          comentario: createRamoDto.comentario ?? '',
          intento: createRamoDto.intento ?? 1,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Ya existe un ramo con ese nombre en este semestre y carrera.',
        );
      }
      throw error;
    }
  }

  async update(id_ramo: number, updateRamoDto: UpdateRamoDto): Promise<ramo> {
    try {
      return await this.prisma.ramo.update({
        where: { id: id_ramo },
        data: updateRamoDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Ramo ${id_ramo} no encontrado.`);
      }
      throw error;
    }
  }

  async remove(id_ramo: number): Promise<ramo> {
    try {
      return await this.prisma.ramo.delete({ where: { id: id_ramo } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Ramo ${id_ramo} no encontrado.`);
      }
      throw error;
    }
  }

  async findAllByCarrera(codigo_carrera: number): Promise<RamoConDetalle[]> {
    return this.prisma.ramo.findMany({
      where: { codigo_carrera },
      include: { semestre: true },
      orderBy: [
        { semestre: { year: 'asc' } },
        { semestre: { semestre: 'asc' } },
      ],
    }) as Promise<RamoConDetalle[]>;
  }

  findAllByEstudiante(rut_estudiante: string): Promise<ramo[]> {
    return this.prisma.ramo.findMany({ where: { rut_estudiante } });
  }

  findOne(id_ramo: number): Promise<ramo | null> {
    return this.prisma.ramo.findUnique({ where: { id: id_ramo } });
  }

  async updateCertificado(
    id_ramo: number,
    url_certificado: string,
  ): Promise<ramo> {
    try {
      return await this.prisma.ramo.update({
        where: { id: id_ramo },
        data: { url_certificado },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Ramo ${id_ramo} no encontrado.`);
      }
      throw error;
    }
  }
}
