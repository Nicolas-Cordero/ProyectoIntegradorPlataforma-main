import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ESTADOS_ESPERAN_NOTA } from './alerta-notas.service';

/**
 * Consultas de las alertas. Todas son en bloque: reciben la lista de ruts a
 * evaluar y hacen una sola consulta, sin importar cuántos estudiantes sean.
 */
@Injectable()
export class AlertasRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Ruts de los estudiantes, opcionalmente solo los de una generación (año).
  async findRutsEstudiantes(año?: number): Promise<string[]> {
    const estudiantes = await this.prisma.estudiante.findMany({
      where: año === undefined ? {} : { generacion_rel: { año } },
      select: { rut_estudiante: true },
    });
    return estudiantes.map((e) => e.rut_estudiante);
  }

  // Fecha de la última entrevista de cada estudiante (GROUP BY rut). Los que
  // no tienen entrevistas no aparecen en el mapa.
  async getUltimaEntrevistaPorEstudiante(
    ruts: string[],
  ): Promise<Map<string, Date>> {
    const ultimas = await this.prisma.entrevista.groupBy({
      by: ['rut_estudiante'],
      where: { rut_estudiante: { in: ruts } },
      _max: { fecha_hora: true },
    });
    return new Map(
      ultimas.flatMap((u) =>
        u._max.fecha_hora ? [[u.rut_estudiante, u._max.fecha_hora]] : [],
      ),
    );
  }

  // Ramos que todavía esperan nota final, con su semestre incluido en la
  // misma consulta.
  async getRamosSinNota(ruts: string[]) {
    return this.prisma.ramo.findMany({
      where: {
        rut_estudiante: { in: ruts },
        estado: { in: ESTADOS_ESPERAN_NOTA },
        nota_final: null,
      },
      orderBy: { id: 'asc' },
      select: {
        nombre: true,
        rut_estudiante: true,
        semestre: { select: { year: true, semestre: true } },
      },
    });
  }

  // Versión vigente del acuerdo = la más reciente (o null si no hay ninguna).
  async getAcuerdoVigente() {
    return this.prisma.acuerdo.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true },
    });
  }

  // Ruts, entre los indicados, que firmaron una versión concreta del acuerdo.
  async getRutsConFirma(acuerdo_id: number, ruts: string[]): Promise<string[]> {
    const firmas = await this.prisma.firma_acuerdo.findMany({
      where: { acuerdo_id, rut_estudiante: { in: ruts } },
      select: { rut_estudiante: true },
    });
    return firmas.map((f) => f.rut_estudiante);
  }
}
