import { Injectable } from '@nestjs/common';
import { EstadoEstudiante, historial_estado_carrera } from '@prisma/client';
import { HistorialEstadoCarreraRepository } from './historial-estado-carrera.repository';
import { CreateHistorialEstadoCarreraDto } from './dto';

function contarSemestres(start: Date, end: Date): number {
  let count = 0;
  for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
    const s1Start = new Date(year, 0, 1);
    const s1End   = new Date(year, 5, 30);
    const s2Start = new Date(year, 6, 1);
    const s2End   = new Date(year, 11, 31);
    if (start <= s1End && end >= s1Start) count++;
    if (start <= s2End && end >= s2Start) count++;
  }
  return count;
}

export function calcularSemestresSupendidosFromHistorial(
  historial: Pick<historial_estado_carrera, 'estado_nuevo' | 'created_at'>[],
  hoje: Date = new Date(),
): number {
  const intervals: { start: Date; end: Date }[] = [];
  let suspensionStart: Date | null = null;

  for (const h of historial) {
    if (h.estado_nuevo === EstadoEstudiante.SUSPENDIDO && suspensionStart === null) {
      suspensionStart = h.created_at;
    } else if (h.estado_nuevo !== EstadoEstudiante.SUSPENDIDO && suspensionStart !== null) {
      intervals.push({ start: suspensionStart, end: h.created_at });
      suspensionStart = null;
    }
  }

  if (suspensionStart !== null) {
    intervals.push({ start: suspensionStart, end: hoje });
  }

  return intervals.reduce((total, { start, end }) => total + contarSemestres(start, end), 0);
}

@Injectable()
export class HistorialEstadoCarreraService {
  constructor(private readonly repo: HistorialEstadoCarreraRepository) {}

  registrarEstadoInicial(codigo_carrera: number, rut_usuario: string): Promise<historial_estado_carrera> {
    return this.repo.registrar({
      codigo_carrera,
      estado_anterior: null,
      estado_nuevo: EstadoEstudiante.ACTIVO,
      rut_usuario,
    });
  }

  cambiarEstado(dto: CreateHistorialEstadoCarreraDto, rut_usuario: string): Promise<historial_estado_carrera> {
    return this.repo.cambiarEstado(dto.codigo_carrera, dto.estado_nuevo, rut_usuario);
  }

  findByCarrera(codigo_carrera: number) {
    return this.repo.findByCarrera(codigo_carrera);
  }

  async getSemestresSupendidos(codigo_carrera: number): Promise<number> {
    const historial = await this.repo.findByCarrera(codigo_carrera);
    return calcularSemestresSupendidosFromHistorial(historial);
  }
}
