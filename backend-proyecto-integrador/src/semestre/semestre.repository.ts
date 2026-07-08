import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  ): Promise<
    (semestre & { cerrado: boolean; url_certificado: string | null })[]
  > {
    const links = await this.prisma.semestre_carrera.findMany({
      where: { codigo_carrera },
      include: { semestre: true },
    });
    return links.map((l) => ({
      ...l.semestre,
      cerrado: l.cerrado,
      url_certificado: l.url_certificado,
    }));
  }

  // Dueño de la carrera, para validar que el estudiante autenticado solo
  // pueda subir el certificado de su propia carrera.
  async findCarreraRut(codigo_carrera: number): Promise<string | null> {
    const carrera = await this.prisma.carrera.findUnique({
      where: { codigo_carrera },
      select: { rut_estudiante: true },
    });
    return carrera?.rut_estudiante ?? null;
  }

  async updateCertificado(
    semestre_id: number,
    codigo_carrera: number,
    url_certificado: string,
  ): Promise<semestre & { cerrado: boolean; url_certificado: string | null }> {
    try {
      const updated = await this.prisma.semestre_carrera.update({
        where: { semestre_id_codigo_carrera: { semestre_id, codigo_carrera } },
        data: { url_certificado },
        include: { semestre: true },
      });
      // Mismo shape aplanado que getByCarrera, para que los clientes puedan
      // parsear la respuesta con el mismo modelo "semestre" en ambos casos.
      return {
        ...updated.semestre,
        cerrado: updated.cerrado,
        url_certificado: updated.url_certificado,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `El semestre ${semestre_id} no está vinculado a la carrera ${codigo_carrera}.`,
        );
      }
      throw error;
    }
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
