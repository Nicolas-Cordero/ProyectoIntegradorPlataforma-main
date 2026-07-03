import { Injectable } from '@nestjs/common';
import { EstadoEstudiante, historial_estado_carrera } from '@prisma/client';
import { HistorialEstadoCarreraRepository } from './historial-estado-carrera.repository';
import { CreateHistorialEstadoCarreraDto } from './dto';

// Duración de referencia de "un semestre": mitad de un año calendario promedio
// (considera años bisiestos). No se usan los bordes exactos de semestre
// (1-ene/30-jun, 1-jul/31-dic) porque lo que se mide acá es tiempo acumulado
// suspendido, no en qué semestre calendario cayó ese tiempo.
const DIAS_POR_SEMESTRE = 365.25 / 2;
const MS_POR_DIA = 1000 * 60 * 60 * 24;

function diasEntre(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / MS_POR_DIA);
}

// Estados en los que la carrera no avanza activamente. Un estudiante eliminado
// o retirado que luego vuelve a estar activo debe contar ese tiempo como
// suspendido igual que si el estado hubiese sido SUSPENDIDO explícitamente.
const ESTADOS_FUERA_DE_CARRERA: EstadoEstudiante[] = [
  EstadoEstudiante.SUSPENDIDO,
  EstadoEstudiante.RETIRADO,
  EstadoEstudiante.ELIMINADO,
];

export function calcularSemestresSupendidosFromHistorial(
  historial: Pick<historial_estado_carrera, 'estado_nuevo' | 'created_at'>[],
  hoje: Date = new Date(),
): number {
  const intervals: { start: Date; end: Date }[] = [];
  let suspensionStart: Date | null = null;

  for (const h of historial) {
    const fueraDeCarrera = ESTADOS_FUERA_DE_CARRERA.includes(h.estado_nuevo);
    if (fueraDeCarrera && suspensionStart === null) {
      suspensionStart = h.created_at;
    } else if (!fueraDeCarrera && suspensionStart !== null) {
      intervals.push({ start: suspensionStart, end: h.created_at });
      suspensionStart = null;
    }
  }

  if (suspensionStart !== null) {
    intervals.push({ start: suspensionStart, end: hoje });
  }

  // Suma el tiempo total fuera de carrera (aunque esté repartido en varios
  // periodos separados) y solo cuenta semestres completos ya transcurridos.
  const totalDiasSuspendido = intervals.reduce(
    (total, { start, end }) => total + diasEntre(start, end),
    0,
  );

  return Math.floor(totalDiasSuspendido / DIAS_POR_SEMESTRE);
}

@Injectable()
export class HistorialEstadoCarreraService {
  constructor(private readonly repo: HistorialEstadoCarreraRepository) {}

  registrarEstadoInicial(
    codigo_carrera: number,
    rut_usuario: string,
  ): Promise<historial_estado_carrera> {
    return this.repo.registrar({
      codigo_carrera,
      estado_anterior: null,
      estado_nuevo: EstadoEstudiante.ACTIVO,
      rut_usuario,
    });
  }

  cambiarEstado(
    dto: CreateHistorialEstadoCarreraDto,
    rut_usuario: string,
  ): Promise<historial_estado_carrera> {
    return this.repo.cambiarEstado(
      dto.codigo_carrera,
      dto.estado_nuevo,
      rut_usuario,
    );
  }

  findByCarrera(codigo_carrera: number) {
    return this.repo.findByCarrera(codigo_carrera);
  }

  async getSemestresSupendidos(codigo_carrera: number): Promise<number> {
    const historial = await this.repo.findByCarrera(codigo_carrera);
    return calcularSemestresSupendidosFromHistorial(historial);
  }
}
