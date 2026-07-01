import { Add as AddIcon, Delete as DeleteIcon, Lock as LockIcon } from '@mui/icons-material';
import type { SemestreUI, RamoUI } from './types';
import { esCerrado, semLabel } from './constants';
import { RamoCard } from './RamoCard';

interface SemestreColumnaProps {
  semestre: SemestreUI;
  canEdit: boolean;
  canAdmin: boolean;
  onCerrar: () => void;
  onEliminar: () => void;
  onAgregarRamo: () => void;
  onEditarRamo: (ramo: RamoUI) => void;
  onEliminarRamo: (ramo: RamoUI) => void;
}

export function SemestreColumna({ semestre, canEdit, canAdmin, onCerrar, onEliminar, onAgregarRamo, onEditarRamo, onEliminarRamo }: SemestreColumnaProps) {
  const cerrado = esCerrado(semestre.ramos);
  const ramoLimitAlcanzado = semestre.tipo === 'RECUPERATIVO' && semestre.ramos.length >= 1;
  const todosConNota = semestre.ramos.length > 0
    && semestre.ramos.every(r => r.estado === 'ELIMINADO' || r.nota_final !== null);
  const puedesCerrar = semestre.ramos.length > 0 && todosConNota;
  const tooltipCierre = semestre.ramos.length === 0
    ? 'Agrega al menos un ramo'
    : !todosConNota
      ? 'Todos los ramos deben tener nota final'
      : undefined;

  return (
    <div className={`w-64 flex-none flex flex-col rounded-xl border-2 overflow-hidden transition-colors ${cerrado ? 'border-green-200' : 'border-gray-200'}`}>
      {/* Encabezado */}
      <div className={`px-4 py-3 flex items-center justify-between ${cerrado ? 'bg-green-50' : 'bg-gray-50'}`}>
        <div>
          <p className="text-base font-bold text-gray-800">
            {semLabel(semestre.year, semestre.tipo, semestre.codigo)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {semestre.tipo === 'RECUPERATIVO' && (
              <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                Recuperativo
              </span>
            )}
            <span className={`text-xs font-semibold ${cerrado ? 'text-green-600' : 'text-gray-400'}`}>
              {cerrado ? '✓ Cerrado' : semestre.soloLocal ? 'Nuevo' : 'Abierto'}
            </span>
          </div>
        </div>
        {canAdmin && (
          <button onClick={onEliminar} title="Eliminar semestre"
            className="p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </button>
        )}
      </div>

      {/* Ramos */}
      <div className="flex-1 p-3 space-y-2">
        {semestre.ramos.length === 0
          ? <p className="text-sm text-gray-400 text-center py-4">Sin ramos registrados</p>
          : semestre.ramos.map(ramo => (
              <RamoCard
                key={ramo.id}
                ramo={ramo}
                semAbierto={!cerrado}
                canEdit={canEdit}
                canAdmin={canAdmin}
                onEditar={() => onEditarRamo(ramo)}
                onEliminar={() => onEliminarRamo(ramo)}
              />
            ))
        }
      </div>

      {/* Acciones (solo semestre abierto y con permisos) */}
      {!cerrado && canEdit && (
        <div className="px-3 pb-3 pt-2 border-t border-gray-100 space-y-2">
          {!ramoLimitAlcanzado ? (
            <button
              onClick={onAgregarRamo}
              className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-[#65B39B] hover:bg-[#65B39B]/8 rounded-lg transition-colors"
            >
              <AddIcon sx={{ fontSize: 16 }} />
              Agregar ramo
            </button>
          ) : (
            <p className="text-sm text-center text-gray-400 py-1">Límite: 1 ramo por recuperativo</p>
          )}
          <button
            onClick={onCerrar}
            disabled={!puedesCerrar}
            title={tooltipCierre}
            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <LockIcon sx={{ fontSize: 15 }} />
            Cerrar semestre
          </button>
          {tooltipCierre && (
            <p className="text-xs text-center text-amber-600 leading-snug">{tooltipCierre}</p>
          )}
        </div>
      )}
    </div>
  );
}
