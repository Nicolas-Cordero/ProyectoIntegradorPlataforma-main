import { Delete as DeleteIcon } from '@mui/icons-material';
import type { RamoUI } from './types';
import { ESTADO_CHIP } from './constants';

interface RamoCardProps {
  ramo: RamoUI;
  semAbierto: boolean;
  canEdit: boolean;
  canAdmin: boolean;
  onEditar: () => void;
  onEliminar: () => void;
}

export function RamoCard({ ramo, semAbierto, canEdit, canAdmin, onEditar, onEliminar }: RamoCardProps) {
  const chip = ESTADO_CHIP[ramo.estado];
  const notaColor = ramo.nota_final === null
    ? 'text-gray-300'
    : ramo.nota_final >= 4 ? 'text-green-600' : 'text-red-500';

  const puedeEditarRamo = semAbierto && canEdit;

  return (
    <div
      onDoubleClick={puedeEditarRamo ? onEditar : undefined}
      title={puedeEditarRamo ? 'Doble clic para editar' : undefined}
      className={`
        rounded-xl border bg-white px-3 py-2.5 group transition-all
        ${puedeEditarRamo
          ? 'border-gray-200 cursor-pointer hover:border-[#65B39B] hover:shadow-sm hover:bg-[#65B39B]/5'
          : 'border-gray-100 cursor-default'}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-base font-semibold text-gray-800 leading-snug break-words flex-1">
          {ramo.nombre}
        </span>
        {semAbierto && canAdmin && (
          <button
            onClick={e => { e.stopPropagation(); onEliminar(); }}
            title="Eliminar ramo"
            className="shrink-0 p-0.5 text-gray-200 hover:text-red-400 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
          >
            <DeleteIcon sx={{ fontSize: 15 }} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <span className={`text-lg font-bold tabular-nums leading-none ${notaColor}`}>
          {ramo.nota_final !== null ? ramo.nota_final.toFixed(1) : '—'}
        </span>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${chip.bg} ${chip.text}`}>
          {chip.label}
        </span>
        {ramo.intento > 1 && (
          <span className="text-sm text-gray-400">· {ramo.intento}° intento</span>
        )}
      </div>

      {puedeEditarRamo && (
        <p className="text-xs text-[#65B39B] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          Doble clic para editar
        </p>
      )}
    </div>
  );
}
