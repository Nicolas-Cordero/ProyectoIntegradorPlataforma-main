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

  // Versión vigente del acuerdo = la más reciente (o null si no hay ninguna).
  async getAcuerdoVigente() {
    return this.prisma.acuerdo.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true },
    });
  }

  // Ruts de los estudiantes que firmaron una versión concreta del acuerdo.
  // Se trae en bloque para resolver el estado de firma de muchos estudiantes
  // con una sola consulta (igual que getAllEntrevistas).
  async getRutsConFirma(acuerdo_id: number): Promise<string[]> {
    const firmas = await this.prisma.firma_acuerdo.findMany({
      where: { acuerdo_id },
      select: { rut_estudiante: true },
    });
    return firmas.map(f => f.rut_estudiante);
  }

  // Verifica si un estudiante puntual firmó una versión del acuerdo.
  async getFirmaAcuerdo(acuerdo_id: number, rut_estudiante: string) {
    return this.prisma.firma_acuerdo.findUnique({
      where: { acuerdo_id_rut_estudiante: { acuerdo_id, rut_estudiante } },
      select: { id: true },
    });
  }
}
