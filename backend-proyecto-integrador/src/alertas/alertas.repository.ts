import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllEstudiantes() {
    const estudiantes = await this.prisma.estudiante.findMany({
      select: {
        rut_estudiante: true,
        generacion_rel: { select: { año: true } },
      },
    });
    return estudiantes.map(e => ({
      rut_estudiante: e.rut_estudiante,
      generacion: String(e.generacion_rel.año),
    }));
  }

  async getAllEntrevistasbyEstudiante(rut_estudiante: string) {
    return this.prisma.entrevista.findMany({
      where: { rut_estudiante },
      select: { id: true, rut_estudiante: true, fecha_hora: true },
    });
  }

  async getAllEntrevistas() {
    return this.prisma.entrevista.findMany({
      select: { id: true, rut_estudiante: true, fecha_hora: true },
    });
  }

  async getAllRamosbyEstudiante(rut_estudiante: string) {
    return this.prisma.ramo.findMany({
      where: { rut_estudiante },
      select: {
        id: true,
        nombre: true,
        estado: true,
        codigo_carrera: true,
        rut_estudiante: true,
        nota_final: true,
        semestre_id: true,
      },
    });
  }

  async getSemestreById(semestre_id: number) {
    return this.prisma.semestre.findUnique({
      where: { semestre_id },
      select: { semestre_id: true, year: true, semestre: true, tipo: true },
    });
  }
}
