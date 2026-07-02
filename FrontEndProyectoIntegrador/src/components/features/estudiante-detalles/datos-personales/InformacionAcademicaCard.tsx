import { InfoCard } from '../InfoCard';
import { InlineField } from './InlineField';
import type { Estudiante } from '../../../../types';
import type { UpdateEstudianteDto } from '../../../../services/estudiante.service';

interface InformacionAcademicaCardProps {
  estudiante: Estudiante;
  generacionLabel: string;
  editable: boolean;
  onSave: (key: keyof UpdateEstudianteDto, value: string) => Promise<boolean>;
}

export function InformacionAcademicaCard({ estudiante, generacionLabel, editable, onSave }: InformacionAcademicaCardProps) {
  return (
    <InfoCard titulo="Información Académica">
      <InlineField label="Generación"    value={generacionLabel} readOnly />
      <InlineField label="Estado General" value={estudiante.estado} readOnly />
      <InlineField label="Promedio Media" value={estudiante.promedios_media} fieldKey="promedios_media" type="number" editable={editable} onSave={onSave} />
    </InfoCard>
  );
}
