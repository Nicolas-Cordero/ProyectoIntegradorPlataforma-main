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
}
