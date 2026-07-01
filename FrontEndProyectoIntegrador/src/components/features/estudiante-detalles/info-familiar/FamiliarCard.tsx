import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Familiar, Parentesco } from '../../../../types';

const PARENTESCO_LABEL: Record<Parentesco, string> = {
  PADRE: 'Padre', MADRE: 'Madre', ABUELO: 'Abuelo', ABUELA: 'Abuela',
  HERMANO: 'Hermano/a', HERMANA: 'Hermana', TIO: 'Tío', TIA: 'Tía',
  PRIMO: 'Primo', PRIMA: 'Prima', OTRO: 'Otro',
};

interface FamiliarCardProps {
  familiar: Familiar;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (f: Familiar) => void;
  onDelete: (id: number) => void;
}

export function FamiliarCard({ familiar, canEdit, canDelete, onEdit, onDelete }: FamiliarCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-5 ${familiar.es_contacto_emergencia ? 'border-[#65B39B] ring-1 ring-[#65B39B]/30' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-bold uppercase tracking-wide text-gray-800">
              {PARENTESCO_LABEL[familiar.parentesco] ?? familiar.parentesco}
            </span>
            {familiar.es_contacto_emergencia && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#65B39B]/15 text-[#3a7a6b] border border-[#65B39B]/40">
                Contacto de emergencia
              </span>
            )}
          </div>
          <span className="text-base text-gray-500 mt-0.5">
            {familiar.nombre}
          </span>
        </div>
        {(canEdit || canDelete) && (
          <div className="flex items-center gap-1">
            {canEdit && (
              <button
                onClick={() => onEdit(familiar)}
                title="Editar"
                className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <EditIcon fontSize="small" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(familiar.id)}
                title="Eliminar"
                className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
              >
                <DeleteIcon fontSize="small" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
        <div>
          <span className="text-sm text-gray-500 uppercase tracking-wide">Teléfono</span>
          <p className="text-base font-medium text-gray-800">{familiar.telefono}</p>
        </div>
        {familiar.observacion && (
          <div className="sm:col-span-2">
            <span className="text-sm text-gray-500 uppercase tracking-wide">Observación</span>
            <p className="text-base text-gray-700 mt-0.5">{familiar.observacion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
