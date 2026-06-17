import { EstadoEstudiante } from '@prisma/client';

// Estados en los que el estudiante puede iniciar sesión en la app móvil.
// (Decisión de negocio a revisar: hoy solo ACTIVO y CONDICIONAL habilitan login.)
const ESTADOS_ACTIVOS: EstadoEstudiante[] = [
  EstadoEstudiante.ACTIVO,
  EstadoEstudiante.CONDICIONAL,
];

/**
 * Indica si, dado el estado del estudiante, su usuario debe poder iniciar sesión.
 * Se usa para derivar `usuario.activo` a partir de `estudiante.estado`.
 */
export function estadoPermiteLogin(estado: EstadoEstudiante): boolean {
  return ESTADOS_ACTIVOS.includes(estado);
}
