import { Injectable } from '@nestjs/common';
import { EstadoRamo } from '@prisma/client';
import { AlertasRepository } from './alertas.repository';
import { Alerta, AlertaTipo } from './entities/alerta.entity';

const DIAS_AVISO_NOTAS = 30;

// Fecha de término de cada semestre (mes 0-indexado).
// La alerta de notas se dispara DIAS_AVISO_NOTAS días después de esta fecha.
const FIN_SEMESTRE: Record<string, { mes: number; dia: number }> = {
  PRIMER_SEMESTRE: { mes: 6, dia: 30 }, // 30 de julio
  SEGUNDO_SEMESTRE: { mes: 11, dia: 30 }, // 30 de diciembre
  INVIERNO: { mes: 7, dia: 30 }, // 30 de agosto
  VERANO: { mes: 2, dia: 0 }, // último día de febrero (28 o 29)
};

interface RamoEstudiante {
  id: number;
  nombre: string;
  estado: EstadoRamo;
  codigo_carrera: number;
  rut_estudiante: string;
  nota_final?: unknown;
  semestre_id: number;
}

/**
 * Regla de negocio de la alerta de ausencia de notas finales.
 *
 * A diferencia de la de entrevistas, esta siempre consulta los ramos por
 * estudiante, así que encapsula su propio acceso al repositorio.
 */
@Injectable()
export class AlertaNotasService {
  constructor(private readonly alertasRepository: AlertasRepository) {}

  /**
   * Genera una alerta por cada ramo del estudiante que, pasados
   * DIAS_AVISO_NOTAS días desde el fin del semestre, aún no tiene nota final.
   *
   * @param opciones.incluirRut             agrega rut_estudiante a la alerta (vistas globales).
   * @param opciones.soloRamosDelEstudiante descarta ramos cuyo rut no coincide con el solicitado.
   */
  async evaluar(
    rut_estudiante: string,
    opciones: { incluirRut: boolean; soloRamosDelEstudiante: boolean },
  ): Promise<Alerta[]> {
    const ramos: RamoEstudiante[] | undefined =
      await this.alertasRepository.getAllRamosbyEstudiante(rut_estudiante);
    if (!ramos) {
      return [];
    }

    const alertas: Alerta[] = [];

    for (const ramo of ramos) {
      if (
        opciones.soloRamosDelEstudiante &&
        ramo.rut_estudiante !== rut_estudiante
      ) {
        continue;
      }
      if (ramo.estado === EstadoRamo.ELIMINADO) {
        continue;
      }
      if (ramo.nota_final != null) {
        continue;
      }

      const semestre = await this.alertasRepository.getSemestreById(
        ramo.semestre_id,
      );
      if (!semestre || !this.semestreVencidoHace30Dias(semestre)) {
        continue;
      }

      const alerta: Alerta = {
        tipo: AlertaTipo.AUSENCIA_NOTAS,
        message: `Alumno sin nota final para ${ramo.nombre}`,
        created_at: new Date(),
      };
      if (opciones.incluirRut) {
        alerta.rut_estudiante = ramo.rut_estudiante;
      }
      alertas.push(alerta);
    }

    return alertas;
  }

  private semestreVencidoHace30Dias(semestre: {
    year: number;
    semestre: string;
  }): boolean {
    const fin = FIN_SEMESTRE[semestre.semestre];
    if (!fin) {
      return false;
    }

    const limite = new Date(semestre.year, fin.mes, fin.dia);
    limite.setDate(limite.getDate() + DIAS_AVISO_NOTAS);

    return new Date() >= limite;
  }
}
