import type { EstadoEstudiante } from '../../types';

// Paleta única para el estado de una carrera (y del estado derivado del
// estudiante, que usa el mismo enum). `hex` es el mismo tono para lo que no
// admite clases de Tailwind (gráficos y estilos inline de estadísticas).
export const ESTADO_CARRERA_CHIP: Record<EstadoEstudiante, { bg: string; text: string; label: string; hex: string }> = {
  ACTIVO:    { bg: 'bg-green-100',  text: 'text-green-700',  label: 'ACTIVO',     hex: '#22C55E' },
  SUSPENDIDO:{ bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'SUSPENDIDO', hex: '#F59E0B' },
  RETIRADO:  { bg: 'bg-red-100',    text: 'text-red-700',    label: 'RETIRADO',   hex: '#EF4444' },
  EGRESADO:  { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'EGRESADO',   hex: '#3B82F6' },
  TITULADO:  { bg: 'bg-purple-100', text: 'text-purple-700', label: 'TITULADO',   hex: '#A855F7' },
  ELIMINADO: { bg: 'bg-gray-100',   text: 'text-gray-500',   label: 'ELIMINADO',  hex: '#9CA3AF' },
};

export const ESTADO_CARRERA_OPTS: { valor: EstadoEstudiante; etiqueta: string }[] = [
  { valor: 'ACTIVO',     etiqueta: 'ACTIVO'     },
  { valor: 'SUSPENDIDO', etiqueta: 'SUSPENDIDO' },
  { valor: 'RETIRADO',   etiqueta: 'RETIRADO'   },
  { valor: 'EGRESADO',   etiqueta: 'EGRESADO'   },
  { valor: 'TITULADO',   etiqueta: 'TITULADO'   },
  { valor: 'ELIMINADO',  etiqueta: 'ELIMINADO'  },
];
