import type { EstadoEstudiante } from '../../../types';

export type PieItem = { label: string; count: number; pct: number; color: string };

export interface CohorteRow {
  año: number;
  total: number;
  counts: Record<string, number>;
}

export const fmtNum = (n: number) => n.toLocaleString('es-CL');
export const fmtPct = (n: number) => `${n.toFixed(1).replace('.', ',')}%`;

// Etiquetas y colores de estado: paleta única en components/common/constants.ts
// (ESTADO_CARRERA_CHIP). Aquí solo el orden de presentación.
export const ESTADO_ORDER: EstadoEstudiante[] = [
  'ACTIVO', 'TITULADO', 'EGRESADO', 'SUSPENDIDO', 'RETIRADO', 'ELIMINADO',
];
