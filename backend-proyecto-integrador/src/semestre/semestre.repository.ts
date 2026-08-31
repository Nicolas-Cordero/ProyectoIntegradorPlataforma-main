import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoRamo, Prisma, semestre } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSemestreDto } from './dto/create-semestre.dto';

// Lo que el cierre necesita saber de un ramo para decidir su estado final.
export interface RamoParaCierre {
  id: number;
  estado: EstadoRamo;
  nota_final: number | null;
}

// Estado final que el servicio decidió para un ramo concreto.
export interface CambioEstadoRamo {
  id: number;
  estado: EstadoRamo;
}

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

  // Persistencia del cierre de un semestre para una carrera. Deliberadamente no
  // decide nada: qué estado final le corresponde a cada ramo es una regla de
  // negocio y vive en SemestreService. Aquí solo se abre la transacción, se leen
  // los ramos, se aplican los cambios que el servicio pidió y se marca el flag
  // `cerrado` de semestre_carrera — que es lo único que determina si el semestre
  // está cerrado; nunca se deriva del estado de los ramos.
  async cerrarSemestre(
    semestre_id: number,
    codigo_carrera: number,
    calcularCambios: (ramos: RamoParaCierre[]) => CambioEstadoRamo[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const ramos = await tx.ramo.findMany({
        where: { semestre_id, codigo_carrera },
        select: { id: true, estado: true, nota_final: true },
      });

      const cambios = calcularCambios(
        ramos.map((r) => ({
          id: r.id,
          estado: r.estado,
          // Decimal de Prisma → number, para que la regla de negocio trabaje
          // con notas y no con un tipo del ORM.
          nota_final: r.nota_final === null ? null : Number(r.nota_final),
        })),
      );

      for (const cambio of cambios) {
        await tx.ramo.update({
          where: { id: cambio.id },
          data: { estado: cambio.estado },
        });
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
