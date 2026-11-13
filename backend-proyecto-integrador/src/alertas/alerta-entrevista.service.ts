import { Injectable } from '@nestjs/common';
import { Alerta, AlertaTipo } from './entities/alerta.entity';

const MS_POR_DIA = 1000 * 60 * 60 * 24;
const DIAS_LIMITE = 60; // 2 meses sin entrevista

/**
 * Regla de negocio de la alerta de entrevistas.
 *
 * Es lógica pura: recibe la fecha de la última entrevista de un estudiante y
 * decide si corresponde una alerta. El gestor (AlertasService) trae esas
 * fechas en bloque.
 */
@Injectable()
export class AlertaEntrevistaService {
  /**
   * Devuelve una alerta si el estudiante nunca ha tenido una entrevista
   * (`ultimaEntrevista` undefined) o si su última entrevista fue hace más de
   * DIAS_LIMITE días. En caso contrario devuelve null.
   */
  evaluar(ultimaEntrevista: Date | undefined): Alerta | null {
    if (!ultimaEntrevista) {
      return {
        tipo: AlertaTipo.ENTREVISTA_VENCIDA,
        message: 'Estudiante sin entrevista',
        created_at: new Date(),
      };
    }

    const dias = Math.floor(
      (Date.now() - ultimaEntrevista.getTime()) / MS_POR_DIA,
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
