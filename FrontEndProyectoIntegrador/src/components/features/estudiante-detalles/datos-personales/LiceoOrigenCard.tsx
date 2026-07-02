import { InfoCard } from '../InfoCard';
import { InlineField } from './InlineField';
import type { Liceo } from '../../../../types';
import type { UpdateEstudianteDto } from '../../../../services/estudiante.service';

interface LiceoOrigenCardProps {
  liceo: Liceo | null;
  rbdLiceo: string;
  editable: boolean;
  onSave: (key: keyof UpdateEstudianteDto, value: string) => Promise<boolean>;
}

export function LiceoOrigenCard({ liceo, rbdLiceo, editable, onSave }: LiceoOrigenCardProps) {
  return (
    <InfoCard titulo="Liceo de Origen">
      {liceo ? (
        <>
          <InlineField label="Nombre"       value={liceo.nombre}       readOnly />
          <InlineField label="RBD"          value={liceo.rbd}          readOnly />
          <InlineField label="Comuna"       value={liceo.comuna}       readOnly />
          <InlineField label="Especialidad" value={liceo.especialidad} readOnly />
        </>
      ) : (
        <div>
          <p className="text-sm text-gray-400 italic mb-3">No se encontró información del liceo (RBD: {rbdLiceo})</p>
          <InlineField label="RBD" value={rbdLiceo} fieldKey="rbd_liceo" editable={editable} onSave={onSave} />
        </div>
      )}
    </InfoCard>
  );
}
