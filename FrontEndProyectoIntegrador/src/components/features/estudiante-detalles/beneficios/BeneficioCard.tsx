import { Delete as DeleteIcon } from '@mui/icons-material';
import type { Beneficio, BeneficioEstudiante } from '../../../../types';

const ESTADO_CHIP: Record<BeneficioEstudiante['estado'], { bg: string; text: string; label: string }> = {
  ACTIVO:     { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Activo'      },
  SUSPENDIDO: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Suspendido'  },
  FINALIZADO: { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Finalizado'  },
  RECHAZADO:  { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Rechazado'   },
  EN_TRAMITE: { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'En trámite'  },
};

const TIPO_LABEL: Record<string, string> = {
  ARANCEL:     'Arancel',
  MANUTENCION: 'Manutención',
};

function fmtFecha(fecha: Date | string | null | undefined): string {
  if (!fecha) return '—';
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface BeneficioCardProps {
  asignacion: BeneficioEstudiante;
  beneficio: Beneficio;
  canEdit: boolean;
  onEliminar: () => void;
}

export function BeneficioCard({ asignacion, beneficio, canEdit, onEliminar }: BeneficioCardProps) {
  const chip = ESTADO_CHIP[asignacion.estado];

  return (
    <div className="group flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-[#65B39B]/60 hover:shadow-sm transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-800">{beneficio.nombre}</span>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${chip.bg} ${chip.text}`}>
            {chip.label}
          </span>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700">
            {TIPO_LABEL[beneficio.tipo] ?? beneficio.tipo}
          </span>
        </div>

        <p className="text-xs text-gray-500 mt-0.5">{beneficio.proveedor}</p>

        {beneficio.descripcion && (
          <p className="text-xs text-gray-400 mt-0.5 truncate" title={beneficio.descripcion}>
            {beneficio.descripcion}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
          {beneficio.monto > 0 && (
            <span>
              <span className="font-medium text-gray-700">Monto: </span>
              {beneficio.monto.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })}
            </span>
          )}
          <span>
            <span className="font-medium text-gray-700">Desde: </span>{fmtFecha(asignacion.inicio)}
          </span>
          <span>
            <span className="font-medium text-gray-700">Hasta: </span>
            {asignacion.fin ? fmtFecha(asignacion.fin) : 'Sin especificar'}
          </span>
        </div>
      </div>

      {canEdit && (
        <button
          onClick={onEliminar}
          title="Quitar beneficio"
          className="shrink-0 mt-0.5 p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </button>
      )}
    </div>
  );
}
