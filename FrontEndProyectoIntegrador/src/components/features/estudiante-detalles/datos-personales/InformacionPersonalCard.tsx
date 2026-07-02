import { InfoCard } from '../InfoCard';
import { InlineField } from './InlineField';
import type { Estudiante } from '../../../../types';
import type { UpdateEstudianteDto } from '../../../../services/estudiante.service';

function formatFecha(fecha: Date | string | undefined): string {
  if (!fecha) return 'No especificado';
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (isNaN(d.getTime())) return 'No especificado';
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function calcularEdad(fechaNacimiento: Date | string | undefined): string {
  if (!fechaNacimiento) return 'No especificado';
  const fecha = typeof fechaNacimiento === 'string' ? new Date(fechaNacimiento) : fechaNacimiento;
  if (isNaN(fecha.getTime())) return 'No especificado';
  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const mes = hoy.getMonth() - fecha.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) edad--;
  return `${edad} años`;
}

interface InformacionPersonalCardProps {
  estudiante: Estudiante;
  editable: boolean;
  onSave: (key: keyof UpdateEstudianteDto, value: string) => Promise<boolean>;
}

export function InformacionPersonalCard({ estudiante, editable, onSave }: InformacionPersonalCardProps) {
  return (
    <InfoCard titulo="Información Personal" defaultExpanded>
      <InlineField label="Nombre"              value={estudiante.nombre}                fieldKey="nombre"    editable={editable} onSave={onSave} />
      <InlineField label="Apellido"             value={estudiante.apellido}              fieldKey="apellido"  editable={editable} onSave={onSave} />
      <InlineField label="RUT"                  value={estudiante.rut_estudiante}        readOnly />
      <InlineField label="Fecha de Nacimiento"  value={formatFecha(estudiante.fecha_nacimiento)} readOnly />
      <InlineField label="Edad"                 value={calcularEdad(estudiante.fecha_nacimiento)} readOnly />
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
