import type { Estudiante } from '../../../types';
import type { ResumenEntrevistasEstudiante } from '../../../services/entrevista.service';

// Agrega a cada estudiante su última entrevista y las entrevistas del año,
// a partir del resumen de GET /entrevistas/resumen.
export function conResumenEntrevistas<T extends Estudiante>(
  estudiantes: T[],
  resumen: ResumenEntrevistasEstudiante[],
): (T & { ultimaEntrevista?: string; totalEntrevistasAno: number })[] {
  const porRut = new Map(resumen.map((r) => [r.rut_estudiante, r]));
  return estudiantes.map((e) => {
    const r = porRut.get(e.rut_estudiante);
    return {
      ...e,
      ultimaEntrevista: r?.ultima_entrevista ?? undefined,
      totalEntrevistasAno: r?.entrevistas_anio ?? 0,
    };
  });
}
