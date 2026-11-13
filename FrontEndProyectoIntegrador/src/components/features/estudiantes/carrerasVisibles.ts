import type { Carrera, EstadoEstudiante, Estudiante } from '../../../types';

// Estados de carrera relevantes para los listados de estudiantes. Las carreras
// suspendidas, retiradas o eliminadas (p. ej. tras un cambio de carrera) no se
// muestran ni se consideran en el filtro de institución.
const ESTADOS_VISIBLES: ReadonlySet<EstadoEstudiante> = new Set(['ACTIVO', 'EGRESADO', 'TITULADO']);

// Copia de las carreras ordenada de la última ingresada a la primera.
export function ordenarPorIngreso(carreras: Carrera[]): Carrera[] {
  return [...carreras].sort((a, b) => b.anio_ingreso - a.anio_ingreso || b.codigo_carrera - a.codigo_carrera);
}

// Carreras visibles del estudiante, de la última ingresada a la primera.
export function carrerasVisibles(estudiante: Estudiante): Carrera[] {
  return ordenarPorIngreso((estudiante.carreras ?? []).filter((c) => ESTADOS_VISIBLES.has(c.estado)));
}
