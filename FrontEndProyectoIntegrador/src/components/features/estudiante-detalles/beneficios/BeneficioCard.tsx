import { useState } from 'react';
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { Beneficio, BeneficioEstudiante } from '../../../../types';
import { formatDate, toInputDate } from '../../../../utils/dateUtils';
import { chipEstado, ESTADO_OPTS, TIPO_LABEL, type EstadoBeneficio } from './constants';

/** Campos de la asignación que se pueden editar desde la tarjeta. */
export type CambiosAsignacion = Partial<Pick<BeneficioEstudiante, 'inicio' | 'estado'>>;

interface BeneficioCardProps {
  asignacion: BeneficioEstudiante;
  beneficio: Beneficio;
  canEdit: boolean;
  onEliminar: () => void;
  /** Persiste los cambios. No debe lanzar: el error lo reporta el padre. */
  onActualizar: (cambios: CambiosAsignacion) => Promise<void>;
}

const ETIQUETA = 'text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1';

export function BeneficioCard({
  asignacion, beneficio, canEdit, onEliminar, onActualizar,
}: BeneficioCardProps) {
  const [guardando, setGuardando] = useState(false);
  const chip = chipEstado(asignacion.estado);
  const inicioInput = toInputDate(asignacion.inicio);

  const guardar = async (cambios: CambiosAsignacion) => {
    setGuardando(true);
    try {
      await onActualizar(cambios);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="group rounded-xl border border-gray-200 bg-white px-5 py-4 hover:border-[#65B39B]/60 hover:shadow-sm transition-all">
      {/* Encabezado: nombre + tipo, y la papelera al extremo */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-semibold text-gray-800">{beneficio.nombre}</h4>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700">
              {TIPO_LABEL[beneficio.tipo] ?? beneficio.tipo}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{beneficio.proveedor}</p>
        </div>

        {canEdit && (
          <button
            onClick={onEliminar}
            title="Quitar beneficio"
            aria-label={`Quitar ${beneficio.nombre}`}
            className="shrink-0 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg
              transition-colors opacity-60 group-hover:opacity-100 focus:opacity-100"
          >
            <DeleteIcon sx={{ fontSize: 20 }} />
          </button>
        )}
      </div>

      {/* Controles: en dos columnas cuando hay ancho, apilados si no */}
      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <div>
          <p className={ETIQUETA}>Estado</p>
          {canEdit ? (
            <span className="relative inline-flex items-center">
              <select
                value={asignacion.estado}
                disabled={guardando}
                onChange={e => {
                  const estado = e.target.value as EstadoBeneficio;
                  if (estado !== asignacion.estado) void guardar({ estado });
                }}
                aria-label={`Estado de ${beneficio.nombre}`}
                className={`appearance-none cursor-pointer rounded-full pl-3 pr-7 py-1 text-sm font-semibold
                  focus:outline-none focus:ring-2 focus:ring-[#65B39B]/50
                  disabled:opacity-60 disabled:cursor-wait ${chip.bg} ${chip.text}`}
              >
                {ESTADO_OPTS.map(opt => (
                  <option key={opt} value={opt} className="bg-white text-gray-800">
                    {chipEstado(opt).label}
                  </option>
                ))}
              </select>
              <span className={`pointer-events-none absolute right-2.5 text-xs ${chip.text}`}>▾</span>
            </span>
          ) : (
            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${chip.bg} ${chip.text}`}>
              {chip.label}
            </span>
          )}
        </div>

        <div>
          <p className={ETIQUETA}>Fecha de inicio</p>
          {canEdit ? (
            <input
              type="date"
              value={inicioInput}
              disabled={guardando}
              onChange={e => {
                const inicio = e.target.value;
                // Un input de fecha entrega '' mientras la fecha está incompleta.
                if (inicio && inicio !== inicioInput) void guardar({ inicio });
              }}
              aria-label={`Fecha de inicio de ${beneficio.nombre}`}
              className="w-full max-w-[11rem] border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-700
                focus:outline-none focus:ring-2 focus:ring-[#65B39B]/40 focus:border-[#65B39B]
                disabled:opacity-60 disabled:cursor-wait"
            />
          ) : (
            <p className="text-sm text-gray-700 py-1">{formatDate(asignacion.inicio)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
