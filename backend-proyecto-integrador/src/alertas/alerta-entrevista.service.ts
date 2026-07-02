import { Injectable } from '@nestjs/common';
import { Alerta, AlertaTipo } from './entities/alerta.entity';

const MS_POR_DIA = 1000 * 60 * 60 * 24;
const DIAS_LIMITE = 60; // 2 meses sin entrevista

/**
 * Regla de negocio de la alerta de entrevistas.
 *
 * Es lógica pura: recibe las entrevistas de un estudiante y decide si
 * corresponde una alerta. La obtención de las entrevistas queda en el gestor
 * (AlertasService) porque la estrategia de carga varía según el endpoint
 * (todas de una vez vs. por estudiante).
 */
@Injectable()
export class AlertaEntrevistaService {
  /**
   * Devuelve una alerta si el estudiante nunca ha tenido una entrevista o si
   * su última entrevista fue hace más de DIAS_LIMITE días. En caso contrario
   * devuelve null.
   */
  evaluar(entrevistas: { fecha_hora: Date }[]): Alerta | null {
    if (entrevistas.length === 0) {
      return {
        tipo: AlertaTipo.ENTREVISTA_VENCIDA,
        message: 'Estudiante sin entrevista',
        created_at: new Date(),
      };
    }

    const ultima = [...entrevistas].sort(
      (a, b) => b.fecha_hora.getTime() - a.fecha_hora.getTime(),
    )[0];
    const dias = Math.floor(
      (Date.now() - ultima.fecha_hora.getTime()) / MS_POR_DIA,
    );

    if (dias > DIAS_LIMITE) {
      return {
        tipo: AlertaTipo.ENTREVISTA_VENCIDA,
        message: `Estudiante sin entrevista hace más de ${dias} días`,
        created_at: new Date(),
      };
    }

    return null;
  }
}
