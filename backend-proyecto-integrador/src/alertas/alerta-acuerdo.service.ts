import { Injectable } from '@nestjs/common';
import { Alerta, AlertaTipo } from './entities/alerta.entity';

/**
 * Regla de negocio de la alerta de firma del acuerdo de compromiso.
 *
 * Es lógica pura: el acuerdo vigente es un valor global (el mismo para todos
 * los estudiantes), así que el gestor (AlertasService) lo resuelve una sola vez
 * y aquí solo se decide, por estudiante, si corresponde la alerta.
 *
 * Política: se debe firmar SIEMPRE la versión vigente. Como cada edición del
 * acuerdo genera una versión nueva sin firmas, basta con verificar si el
 * estudiante tiene firma para el acuerdo vigente.
 */
@Injectable()
export class AlertaAcuerdoService {
  /**
   * Devuelve una alerta si existe un acuerdo vigente y el estudiante aún no lo
   * ha firmado. Si no hay ningún acuerdo registrado (nada que firmar) o el
   * estudiante ya firmó la versión vigente, devuelve null.
   *
   * @param acuerdoVigente versión vigente del acuerdo, o null si no hay acuerdos.
   * @param yaFirmo        si el estudiante tiene firma para esa versión vigente.
   */
  evaluar(
    acuerdoVigente: { id: number } | null,
    yaFirmo: boolean,
  ): Alerta | null {
    if (!acuerdoVigente || yaFirmo) {
      return null;
    }

    return {
      tipo: AlertaTipo.FIRMAR_ACUERDO,
      message: 'Estudiante no ha firmado el acuerdo de compromiso vigente',
      created_at: new Date(),
    };
  }
}
