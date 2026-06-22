import { EstadoEstudiante } from '@prisma/client';

// Solo estudiantes ACTIVOS pueden iniciar sesión en la app móvil.
const ESTADOS_ACTIVOS: EstadoEstudiante[] = [
  EstadoEstudiante.ACTIVO,
];

/**
 * Indica si, dado el estado del estudiante, su usuario debe poder iniciar sesión.
 * Se usa para derivar `usuario.activo` a partir de `estudiante.estado`.
 */
export function estadoPermiteLogin(estado: EstadoEstudiante): boolean {
  return ESTADOS_ACTIVOS.includes(estado);
}
