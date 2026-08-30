import { InfoCard } from '../InfoCard';
import { InlineField } from './InlineField';
import type { Estudiante } from '../../../../types';
import type { UpdateEstudianteDto } from '../../../../services/estudiante.service';
import { formatDate, calculateAge } from '../../../../utils/dateUtils';

interface InformacionPersonalCardProps {
  estudiante: Estudiante;
  editable: boolean;
  onSave: (key: keyof UpdateEstudianteDto, value: string) => Promise<boolean>;
}

export function InformacionPersonalCard({ estudiante, editable, onSave }: InformacionPersonalCardProps) {
  const edad = calculateAge(estudiante.fecha_nacimiento);

  return (
    <InfoCard titulo="Información Personal" defaultExpanded>
      <InlineField label="Nombre"              value={estudiante.nombre}                fieldKey="nombre"    editable={editable} onSave={onSave} />
      <InlineField label="Apellido"             value={estudiante.apellido}              fieldKey="apellido"  editable={editable} onSave={onSave} />
      <InlineField label="RUT"                  value={estudiante.rut_estudiante}        readOnly />
      <InlineField label="Fecha de Nacimiento"  value={formatDate(estudiante.fecha_nacimiento, 'No especificado')} readOnly />
      <InlineField label="Edad"                 value={edad === null ? 'No especificado' : `${edad} años`} readOnly />
      <InlineField label="Género"               value={estudiante.genero}                fieldKey="genero"    editable={editable}
        type="select"
        options={[
          { value: 'MASCULINO',  label: 'Masculino'  },
          { value: 'FEMENINO',   label: 'Femenino'   },
          { value: 'NO_BINARIO', label: 'No binario' },
        ]}
        onSave={onSave}
      />
      <InlineField label="Dirección"            value={estudiante.direccion}             fieldKey="direccion" editable={editable} onSave={onSave} />
      <InlineField label="Correo Electrónico"   value={estudiante.email}                 fieldKey="email"     type="email" editable={editable} onSave={onSave} />
      <InlineField label="Teléfono"             value={estudiante.telefono}              fieldKey="telefono"  type="tel"   editable={editable} onSave={onSave} />
    </InfoCard>
  );
}
