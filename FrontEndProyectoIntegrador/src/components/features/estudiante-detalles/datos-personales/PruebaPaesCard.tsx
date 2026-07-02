import { InfoCard } from '../InfoCard';
import { PaesField } from './PaesField';
import type { Paes } from '../../../../types';
import type { UpdatePaesDto } from '../../../../services/paes.service';

interface PruebaPaesCardProps {
  paes: Paes | null;
  loading: boolean;
  editable: boolean;
  onSave: (key: keyof UpdatePaesDto, value: string) => Promise<boolean>;
  onRegistrarClick: () => void;
}

export function PruebaPaesCard({ paes, loading, editable, onSave, onRegistrarClick }: PruebaPaesCardProps) {
  return (
    <InfoCard titulo="Prueba PAES">
      {loading ? (
        <p className="text-sm text-gray-400 italic py-3">Cargando puntajes...</p>
      ) : paes ? (
        <>
          <PaesField label="Competencia Lectora"        value={paes.lenguaje}     paesKey="lenguaje"     editable={editable} onSave={onSave} />
          <PaesField label="Competencia Matemática M1"  value={paes.matematicas}  paesKey="matematicas"  editable={editable} onSave={onSave} />
          <PaesField label="NEM"                        value={paes.nem}          paesKey="nem"          editable={editable} onSave={onSave} />
          <PaesField label="Ranking"                    value={paes.ranking}      paesKey="ranking"      editable={editable} onSave={onSave} />
          {paes.matematicas2 != null && (
            <PaesField label="Competencia Matemática M2" value={paes.matematicas2} paesKey="matematicas2" editable={editable} onSave={onSave} />
          )}
          {paes.ciencias != null && (
            <PaesField label="Ciencias"                   value={paes.ciencias}    paesKey="ciencias"     editable={editable} onSave={onSave} />
          )}
          {paes.historia != null && (
            <PaesField label="Historia y Ciencias Sociales" value={paes.historia}  paesKey="historia"     editable={editable} onSave={onSave} />
          )}
        </>
      ) : (
        <div className="py-3">
          <p className="text-sm text-gray-500 italic mb-3">Sin prueba PAES registrada.</p>
          {editable && (
            <button
              onClick={onRegistrarClick}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#65B39B] rounded-lg hover:bg-[#4a9a83] transition-colors"
            >
              Registrar puntajes PAES
            </button>
          )}
        </div>
      )}
    </InfoCard>
  );
}
