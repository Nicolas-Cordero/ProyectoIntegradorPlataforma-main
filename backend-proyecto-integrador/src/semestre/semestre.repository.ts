import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { EstadoRamo, Prisma, semestre } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSemestreDto } from './dto/create-semestre.dto';

@Injectable()
export class SemestreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSemestreDto: CreateSemestreDto): Promise<semestre> {
    try {
      return await this.prisma.semestre.create({ data: createSemestreDto });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Ya existe un semestre ${createSemestreDto.semestre} para el año ${createSemestreDto.year}.`,
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<semestre[]> {
    return this.prisma.semestre.findMany({
      orderBy: [{ year: 'asc' }, { semestre: 'asc' }],
    });
  }

  async findOne(id: number): Promise<semestre | null> {
    return this.prisma.semestre.findUnique({ where: { semestre_id: id } });
  }

  async findByYearAndCodigo(
    year: number,
    semestre: string,
  ): Promise<semestre | null> {
    return this.prisma.semestre.findFirst({ where: { year, semestre } });
  }

  async linkCarrera(
    semestre_id: number,
    codigo_carrera: number,
  ): Promise<void> {
    await this.prisma.semestre_carrera.upsert({
      where: { semestre_id_codigo_carrera: { semestre_id, codigo_carrera } },
      create: { semestre_id, codigo_carrera },
      update: {},
    });
  }

  async getByCarrera(
    codigo_carrera: number,
  ): Promise<(semestre & { cerrado: boolean })[]> {
    const links = await this.prisma.semestre_carrera.findMany({
      where: { codigo_carrera },
      include: { semestre: true },
    });
    return links.map((l) => ({ ...l.semestre, cerrado: l.cerrado }));
  }

  // Cierre explícito de un semestre para una carrera: solo el admin/tutor lo
  // dispara (ver guard de roles en el controller). Exige que todo ramo no
  // eliminado ya tenga nota final, y recién ahí calcula su estado final
  // (APROBADO/REPROBADO) a partir de esa nota — nunca al revés. El flag
  // `cerrado` en semestre_carrera es lo único que determina si el semestre
  // está cerrado; no se deriva del estado de los ramos.
  async cerrarSemestre(
    semestre_id: number,
    codigo_carrera: number,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const ramos = await tx.ramo.findMany({
        where: { semestre_id, codigo_carrera },
      });

      const pendientes = ramos.filter(
        (r) => r.estado !== EstadoRamo.ELIMINADO && r.nota_final === null,
      );
      if (pendientes.length > 0) {
        throw new BadRequestException(
          'Todos los ramos deben tener nota final (o estar eliminados) antes de cerrar el semestre.',
        );
      }

      for (const r of ramos) {
        if (r.estado === EstadoRamo.ELIMINADO) continue;
        const nuevoEstado =
          Number(r.nota_final) >= 4 ? EstadoRamo.APROBADO : EstadoRamo.REPROBADO;
        if (r.estado !== nuevoEstado) {
          await tx.ramo.update({ where: { id: r.id }, data: { estado: nuevoEstado } });
        }
      }

      await tx.semestre_carrera.update({
        where: { semestre_id_codigo_carrera: { semestre_id, codigo_carrera } },
        data: { cerrado: true },
      });
    });
  }

  async unlinkCarrera(
    semestre_id: number,
    codigo_carrera: number,
  ): Promise<void> {
    try {
      await this.prisma.semestre_carrera.delete({
        where: { semestre_id_codigo_carrera: { semestre_id, codigo_carrera } },
      });
    } catch (error) {
      // Ignorar si el registro no existe (datos anteriores sin pivot)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        return;
      throw error;
    }
  }
}
