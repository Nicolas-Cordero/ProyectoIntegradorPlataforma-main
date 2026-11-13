import React from 'react';
import { Search as SearchIcon, ExpandMore as ExpandMoreIcon, Close as CloseIcon } from '@mui/icons-material';
import { ESTADO_CARRERA_OPTS } from '../../common/constants';
import type { EstadoEstudiante } from '../../../types';
import type { FiltroAlertas, StudentFiltersValue } from './useStudentFilters';

interface StudentFiltersProps {
  filtros: StudentFiltersValue;
  setFiltro: <K extends keyof StudentFiltersValue>(campo: K, valor: StudentFiltersValue[K]) => void;
  institucionOptions: string[];
  hayFiltrosActivos: boolean;
  onLimpiar: () => void;
}

const FOCO = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65B39B]/40 focus-visible:border-[#65B39B]';

interface FiltroSelectProps {
  etiqueta: string;
  valor: string;
  activo: boolean;
  onChange: (valor: string) => void;
  ancho: string;
  children: React.ReactNode;
}

// Select nativo (accesible y usable en móvil) con chevron propio. Un filtro
// aplicado se tiñe de turquesa para que se vea de un vistazo qué filtra la lista.
const FiltroSelect: React.FC<FiltroSelectProps> = ({ etiqueta, valor, activo, onChange, ancho, children }) => (
  <div className={`relative w-full ${ancho}`}>
    <select
      aria-label={etiqueta}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className={`h-10 w-full appearance-none truncate rounded-lg border pl-3 pr-9 text-sm cursor-pointer transition-colors ${FOCO} ${
        activo
          ? 'border-[#65B39B] bg-[#EEF7F3] text-[#2F6F5C] font-semibold'
          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
      }`}
    >
      {children}
    </select>
    <ExpandMoreIcon
      aria-hidden="true"
      fontSize="small"
      className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${activo ? 'text-[#4A9B7D]' : 'text-stone-400'}`}
    />
  </div>
);

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  filtros,
  setFiltro,
  institucionOptions,
  hayFiltrosActivos,
  onLimpiar,
}) => (
  <div
    role="search"
    className="flex flex-wrap items-center gap-2.5 rounded-xl border border-stone-200 bg-white p-3"
  >
    <div className="relative w-full lg:w-auto lg:flex-1 lg:min-w-[16rem]">
      <SearchIcon
        aria-hidden="true"
        fontSize="small"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
      />
      <input
        type="search"
        name="busqueda-estudiante"
        aria-label="Buscar estudiante por nombre, apellido o RUT"
        autoComplete="off"
        spellCheck={false}
        value={filtros.busqueda}
        onChange={(e) => setFiltro('busqueda', e.target.value)}
        placeholder="Buscar por nombre, apellido o RUT…"
        className={`h-10 w-full rounded-lg border border-stone-200 bg-stone-50 pl-10 pr-3 text-sm text-stone-800 placeholder:text-stone-400 transition-colors hover:border-stone-300 focus:bg-white ${FOCO}`}
      />
    </div>

    <FiltroSelect
      etiqueta="Filtrar por alertas"
      valor={filtros.alertas}
      activo={filtros.alertas !== 'todas'}
      onChange={(v) => setFiltro('alertas', v as FiltroAlertas)}
      ancho="sm:w-40"
    >
      <option value="todas">Alertas: todas</option>
      <option value="con">Con alertas</option>
      <option value="sin">Sin alertas</option>
    </FiltroSelect>

    <FiltroSelect
      etiqueta="Filtrar por institución"
      valor={filtros.institucion}
      activo={!!filtros.institucion}
      onChange={(v) => setFiltro('institucion', v)}
      ancho="sm:w-64"
    >
      <option value="">Todas las instituciones</option>
      {institucionOptions.map((nombre) => (
        <option key={nombre} value={nombre}>{nombre}</option>
      ))}
    </FiltroSelect>

    <FiltroSelect
      etiqueta="Filtrar por estado"
      valor={filtros.estado}
      activo={!!filtros.estado}
      onChange={(v) => setFiltro('estado', v as EstadoEstudiante | '')}
      ancho="sm:w-44"
    >
      <option value="">Todos los estados</option>
      {ESTADO_CARRERA_OPTS.map((o) => (
        <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
      ))}
    </FiltroSelect>

    {hayFiltrosActivos && (
      <button
        type="button"
        onClick={onLimpiar}
        className={`inline-flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-[#C7654F] transition-colors hover:bg-[#C7654F]/10 hover:text-[#A04A38] ${FOCO}`}
      >
        <CloseIcon aria-hidden="true" sx={{ fontSize: 16 }} />
        Limpiar filtros
      </button>
    )}
  </div>
);
