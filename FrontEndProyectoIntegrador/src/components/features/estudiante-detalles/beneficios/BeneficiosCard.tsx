import { InfoCard } from '../InfoCard';
import { BeneficioCard } from './BeneficioCard';
import type { Beneficio, BeneficioEstudiante } from '../../../../types';

interface BeneficiosCardProps {
  asignaciones: BeneficioEstudiante[];
  catalogo: Beneficio[];
  loading: boolean;
  canEdit: boolean;
  onQuitar: (codigo_beneficio: number, nombre: string) => void;
  onAgregarClick: () => void;
}

export function BeneficiosCard({ asignaciones, catalogo, loading, canEdit, onQuitar, onAgregarClick }: BeneficiosCardProps) {
  return (
    <InfoCard titulo="Beneficios">
      {loading ? (
        <p className="text-sm text-gray-400 italic py-3">Cargando beneficios...</p>
      ) : (
        <>
          {asignaciones.length === 0 ? (
            <p className="text-sm text-gray-500 italic py-3">Sin beneficios asignados.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {asignaciones.map(asignacion => {
                const beneficio = catalogo.find(b => b.codigo_beneficio === asignacion.codigo_beneficio);
                if (!beneficio) return null;
                return (
                  <BeneficioCard
                    key={asignacion.codigo_beneficio}
                    asignacion={asignacion}
                    beneficio={beneficio}
                    canEdit={canEdit}
                    onEliminar={() => onQuitar(asignacion.codigo_beneficio, beneficio.nombre)}
                  />
                );
              })}
            </div>
          )}
          {canEdit && (
            <button
              onClick={onAgregarClick}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#65B39B] rounded-lg hover:bg-[#4a9a83] transition-colors"
            >
              + Agregar beneficio
            </button>
          )}
        </>
      )}
    </InfoCard>
  );
}
