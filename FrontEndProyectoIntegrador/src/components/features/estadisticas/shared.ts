import type { EstadoEstudiante } from '../../../types';

export type PieItem = { label: string; count: number; pct: number; color: string };

export interface CohorteRow {
  año: number;
  total: number;
  counts: Record<string, number>;
}

export const fmtNum = (n: number) => n.toLocaleString('es-CL');
export const fmtPct = (n: number) => `${n.toFixed(1).replace('.', ',')}%`;

export const ESTADO_LABELS: Record<EstadoEstudiante, string> = {
  ACTIVO: 'Estudiando', TITULADO: 'Titulado/a', EGRESADO: 'Egresado/a',
  SUSPENDIDO: 'Suspendido/a', RETIRADO: 'Retirado/a', ELIMINADO: 'Eliminado/a',
};

export const ESTADO_COLORS: Record<EstadoEstudiante, string> = {
  ACTIVO: '#65B39B', TITULADO: '#4CAF50', EGRESADO: '#7B8FD4',
  SUSPENDIDO: '#C7654F', RETIRADO: '#9E9E9E', ELIMINADO: '#BF360C',
};

export const ESTADO_ORDER: EstadoEstudiante[] = [
  'ACTIVO', 'TITULADO', 'EGRESADO', 'SUSPENDIDO', 'RETIRADO', 'ELIMINADO',
];
