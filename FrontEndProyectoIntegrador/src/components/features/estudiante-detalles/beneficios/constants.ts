import type { BeneficioEstudiante } from '../../../../types';

export type EstadoBeneficio = BeneficioEstudiante['estado'];

interface ChipEstado {
  bg: string;
  text: string;
  label: string;
}

const ESTADO_CHIP: Record<EstadoBeneficio, ChipEstado> = {
  ACTIVO:     { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Activo'     },
  EN_TRAMITE: { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'En trámite' },
  SUSPENDIDO: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Suspendido' },
  RECHAZADO:  { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Rechazado'  },
  FINALIZADO: { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Finalizado' },
};

/**
 * Colores y etiqueta de un estado. Total a propósito: si el backend enviara un
 * valor fuera del enum (o ninguno), devuelve un chip neutro en vez de dejar que
 * un `undefined.bg` tumbe la vista entera.
 */
export function chipEstado(estado: EstadoBeneficio | undefined | null): ChipEstado {
  return (
    (estado && ESTADO_CHIP[estado]) ?? {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      label: estado ?? '—',
    }
  );
}

/** Estados ofrecidos en los selectores, en orden del ciclo de vida. */
export const ESTADO_OPTS: EstadoBeneficio[] = [
  'EN_TRAMITE',
  'ACTIVO',
  'SUSPENDIDO',
  'RECHAZADO',
  'FINALIZADO',
];

export const TIPO_LABEL: Record<string, string> = {
  ARANCEL:     'Arancel',
  MANUTENCION: 'Manutención',
};
