import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { entrevista, comentario } from '@prisma/client';

// Tipos enriquecidos con las relaciones que necesita el frontend.
export type EntrevistaConRelaciones = entrevista & {
  entrevistador: { nombre: string; apellido: string };
  semestre: {
    semestre_id: number;
    year: number;
    semestre: string;
    tipo: string;
  };
};

// Una entrevista tiene a lo más un comentario general (relación 1-1).
export type EntrevistaConDetalle = EntrevistaConRelaciones & {
  comentario: comentario | null;
};

export interface EntrevistaCreateData {
  rut_estudiante: string;
  rut_entrevistador: string;
  fecha_hora: Date;
  semestre_id: number;
  duracion_s: number;
  resumen?: string;
  comentario?: string;
}

export interface EntrevistaUpdateData {
  fecha_hora?: Date;
  duracion_s?: number;
  resumen?: string;
  semestre_id?: number;
}

@Injectable()
export class EntrevistaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: EntrevistaCreateData): Promise<entrevista> {
    const { comentario, ...fields } = data;
    return this.prisma.entrevista.create({
      data: {
        ...fields,
        // Sin texto no se crea la fila: una entrevista puede quedar sin comentario.
        comentario: comentario ? { create: { texto: comentario } } : undefined,
      },
    });
  }

  async update(
    id_entrevista: number,
    data: EntrevistaUpdateData,
  ): Promise<EntrevistaConDetalle> {
    return this.prisma.entrevista.update({
      where: { id: id_entrevista },
      data,
      include: {
        entrevistador: { select: { nombre: true, apellido: true } },
        semestre: {
          select: { semestre_id: true, year: true, semestre: true, tipo: true },
        },
        comentario: true,
      },
    }) as Promise<EntrevistaConDetalle>;
  }

  // comentario eliminado explícitamente antes del delete porque la relación
  // entrevista→comentario no tiene onDelete: Cascade en el schema actual.
  async delete(id_entrevista: number): Promise<entrevista> {
    return this.prisma.$transaction(async (tx) => {
      await tx.comentario.deleteMany({
        where: { entrevista_id: id_entrevista },
      });
      return tx.entrevista.delete({ where: { id: id_entrevista } });
    });
  }

  async findById(id_entrevista: number): Promise<EntrevistaConDetalle | null> {
    return this.prisma.entrevista.findUnique({
      where: { id: id_entrevista },
      include: {
        entrevistador: { select: { nombre: true, apellido: true } },
        semestre: {
          select: { semestre_id: true, year: true, semestre: true, tipo: true },
        },
        comentario: true,
      },
    }) as Promise<EntrevistaConDetalle | null>;
  }

  async findByEstudiante(
    rut_estudiante: string,
  ): Promise<EntrevistaConRelaciones[]> {
    return this.prisma.entrevista.findMany({
      where: { rut_estudiante },
      include: {
        entrevistador: { select: { nombre: true, apellido: true } },
        semestre: {
          select: { semestre_id: true, year: true, semestre: true, tipo: true },
        },
      },
    }) as Promise<EntrevistaConRelaciones[]>;
  }

  async findByEntrevistador(rut_entrevistador: string): Promise<entrevista[]> {
    return this.prisma.entrevista.findMany({
      where: { rut_entrevistador },
    });
  }

  async findAll(): Promise<entrevista[]> {
    return this.prisma.entrevista.findMany();
  }
}
