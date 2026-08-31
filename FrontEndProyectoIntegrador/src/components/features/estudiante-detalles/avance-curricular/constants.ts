import type { EstadoEstudiante } from '../../../../types';
import type { EstadoRamoAvance } from '../../../../services/ramo-avance.service';
import type { BackendSemestre, TipoSemestre } from '../../../../services/semestre-avance.service';
import type { CodigoSemUI } from './types';

export const UI_TO_BACKEND: Record<CodigoSemUI, BackendSemestre> = {
  '1':        'PRIMER_SEMESTRE',
  '2':        'SEGUNDO_SEMESTRE',
  'INVIERNO': 'INVIERNO',
  'VERANO':   'VERANO',
};

export const BACKEND_TO_UI: Record<BackendSemestre, CodigoSemUI> = {
  PRIMER_SEMESTRE:  '1',
  SEGUNDO_SEMESTRE: '2',
  INVIERNO:         'INVIERNO',
  VERANO:           'VERANO',
};

// Orden cronológico dentro del mismo año: Sem1 → Rec.Invierno → Sem2 → Rec.Verano
export const ORDEN_SEMESTRE: Record<CodigoSemUI, number> = {
  '1':        0,
  'INVIERNO': 1,
  '2':        2,
  'VERANO':   3,
};

export const ESTADO_CARRERA_CHIP: Record<EstadoEstudiante, { bg: string; text: string; label: string }> = {
  ACTIVO:    { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Activo'    },
  SUSPENDIDO:{ bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Suspendido'},
  RETIRADO:  { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Retirado'  },
  EGRESADO:  { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Egresado'  },
  TITULADO:  { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Titulado'  },
  ELIMINADO: { bg: 'bg-gray-100',   text: 'text-gray-500',   label: 'Eliminado' },
};

export const ESTADO_CARRERA_OPTS = [
  { valor: 'ACTIVO',     etiqueta: 'Activo'     },
  { valor: 'SUSPENDIDO', etiqueta: 'Suspendido' },
  { valor: 'RETIRADO',   etiqueta: 'Retirado'   },
  { valor: 'EGRESADO',   etiqueta: 'Egresado'   },
  { valor: 'TITULADO',   etiqueta: 'Titulado'   },
  { valor: 'ELIMINADO',  etiqueta: 'Eliminado'  },
];

export const ESTADO_CHIP: Record<EstadoRamoAvance, { bg: string; text: string; label: string }> = {
  APROBADO:  { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprobado'  },
  REPROBADO: { bg: 'bg-red-100',   text: 'text-red-700',   label: 'Reprobado' },
  CURSANDO:  { bg: 'bg-blue-100',  text: 'text-blue-700',  label: 'Cursando'  },
  ELIMINADO: { bg: 'bg-gray-100',  text: 'text-gray-500',  label: 'Eliminado' },
  PENDIENTE: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
};

export const ESTADO_RAMO_OPTS: { valor: EstadoRamoAvance; etiqueta: string }[] = [
  { valor: 'APROBADO',  etiqueta: 'Aprobado'  },
  { valor: 'REPROBADO', etiqueta: 'Reprobado' },
  { valor: 'CURSANDO',  etiqueta: 'Cursando'  },
  { valor: 'ELIMINADO', etiqueta: 'Eliminado' },
  { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
];

export const VIA_ACCESO_OPTS = [
  { valor: 'REGULAR',  etiqueta: 'Regular'  },
  { valor: 'ESPECIAL', etiqueta: 'Especial' },
  { valor: 'PACE',     etiqueta: 'PACE'     },
];

export function semLabel(year: number, tipo: TipoSemestre, codigo: CodigoSemUI): string {
  if (tipo === 'REGULAR') return `${year} — Semestre ${codigo}`;
  return `${year} — Rec. ${codigo === 'INVIERNO' ? 'Invierno' : 'Verano'}`;
}

export function normalizarNota(valor: number | string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return isNaN(n) ? null : n;
}
