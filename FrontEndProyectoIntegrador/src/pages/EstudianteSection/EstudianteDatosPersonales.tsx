import { useState, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ReactNode } from 'react';
import { estudianteService } from '../../services';
import type { EstudianteOutletContext } from './EstudianteDetail';
import type { Estudiante } from '../../types';
import type { UpdateEstudianteDto } from '../../services/estudiante.service';


function formatFecha(fecha: Date | string | undefined): string {
  if (!fecha) return '—';
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function calcularEdad(fechaNacimiento: Date | string | undefined): string {
  if (!fechaNacimiento) return '—';
  const fecha = typeof fechaNacimiento === 'string' ? new Date(fechaNacimiento) : fechaNacimiento;
  if (isNaN(fecha.getTime())) return '—';
  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const mes = hoy.getMonth() - fecha.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) edad--;
  return `${edad} años`;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
      <h2 className="text-base font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}

type FieldType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'select';

interface InlineFieldProps {
  label: string;
  value: string | number | undefined | null;
  fieldKey?: keyof UpdateEstudianteDto;
  type?: FieldType;
  options?: { value: string; label: string }[];
  editable?: boolean;
  readOnly?: boolean;
  onSave?: (key: keyof UpdateEstudianteDto, value: string) => Promise<void>;
}

function InlineField({ label, value, fieldKey, type = 'text', options, editable, readOnly, onSave }: InlineFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  const displayValue = value ?? '—';

  const startEdit = () => {
    if (!editable || readOnly || !fieldKey) return;
    setDraft(value !== null && value !== undefined ? String(value) : '');
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const save = async () => {
    if (!fieldKey || !onSave) { setEditing(false); return; }
    await onSave(fieldKey, draft);
    setEditing(false);
  };

  const cancel = () => {
    setEditing(false);
    setDraft('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') cancel();
  };

  return (
    <div className="py-2 grid grid-cols-[160px_1fr] gap-4 items-center border-b border-gray-50 last:border-0 group">
      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</span>
      {editing && fieldKey ? (
        options ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={onKeyDown}
            className="text-sm border border-[#65B39B] rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#65B39B] w-full max-w-xs"
          >
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={onKeyDown}
            className="text-sm border border-[#65B39B] rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#65B39B] w-full max-w-xs"
          />
        )
      ) : (
        <span
          onDoubleClick={startEdit}
          title={editable && !readOnly ? 'Doble clic para editar' : undefined}
          className={`text-sm font-semibold text-gray-800 ${
            editable && !readOnly
              ? 'cursor-text underline decoration-dotted decoration-gray-300 group-hover:decoration-[#65B39B]'
              : ''
          }`}
        >
          {String(displayValue)}
        </span>
      )}
    </div>
  );
}

export default function EstudianteDatosPersonales() {
  const { estudiante, liceo, generacion, canEdit, refresh } = useOutletContext<EstudianteOutletContext>();
  const [saveError, setSaveError] = useState('');
  const carreraActual = estudiante.carreras?.find(c => c.activa) ?? estudiante.carreras?.[0] ?? null;
  const generacionLabel = generacion
    ? `${generacion.año}${generacion.descripcion ? ` — ${generacion.descripcion}` : ''}`
    : `ID: ${estudiante.generacion_id ?? '—'}`;

  const handleSave = useCallback(async (key: keyof UpdateEstudianteDto, rawValue: string) => {
    setSaveError('');
    let value: string | number | undefined = rawValue;
    if (key === 'promedios_media' || key === 'puntaje_paes') value = rawValue ? Number(rawValue) : undefined;
    try {
      await estudianteService.update(estudiante.rut_estudiante, { [key]: value });
      refresh();
    } catch (err: any) {
      setSaveError(err?.message || 'Error al guardar el campo');
    }
  }, [estudiante.rut_estudiante, refresh]);

  const e = canEdit;

  return (
    <div>
      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700" role="alert">
          {saveError}
        </div>
      )}
      {canEdit && (
        <p className="text-xs text-gray-400 mb-4 italic">Doble clic sobre un valor para editarlo · Enter para guardar · Esc para cancelar</p>
      )}

      <Section title="Información Personal">
        <InlineField label="Nombre" value={estudiante.nombre} fieldKey="nombre" type="text" editable={e} onSave={handleSave} />
        <InlineField label="Apellido" value={estudiante.apellido} fieldKey="apellido" type="text" editable={e} onSave={handleSave} />
        <InlineField label="RUT" value={estudiante.rut_estudiante} readOnly />
        <InlineField label="Fecha de Nacimiento" value={formatFecha(estudiante.fecha_nacimiento)} readOnly />
        <InlineField label="Edad" value={calcularEdad(estudiante.fecha_nacimiento)} readOnly />
        <InlineField
          label="Género"
          value={estudiante.genero}
          fieldKey="genero"
          type="select"
          editable={e}
          options={[
            { value: 'MASCULINO', label: 'Masculino' },
            { value: 'FEMENINO', label: 'Femenino' },
            { value: 'NO_BINARIO', label: 'No binario' },
          ]}
          onSave={handleSave}
        />
        <InlineField label="Dirección" value={estudiante.direccion} fieldKey="direccion" editable={e} onSave={handleSave} />
        <InlineField label="Correo Electrónico" value={estudiante.email} fieldKey="email" type="email" editable={e} onSave={handleSave} />
        <InlineField label="Teléfono" value={estudiante.telefono} fieldKey="telefono" type="tel" editable={e} onSave={handleSave} />
      </Section>

      <Section title="Información Académica">
        <InlineField label="Generación" value={generacionLabel} readOnly />
        <InlineField
          label="Estado"
          value={estudiante.estado}
          fieldKey="estado"
          type="select"
          editable={e}
          options={[
            { value: 'ACTIVO', label: 'Activo' },
            { value: 'CONDICIONAL', label: 'Condicional' },
            { value: 'SUSPENDIDO', label: 'Suspendido' },
            { value: 'ELIMINADO', label: 'Eliminado' },
            { value: 'RETIRADO', label: 'Retirado' },
            { value: 'EGRESADO', label: 'Egresado' },
            { value: 'TITULADO', label: 'Titulado' },
          ]}
          onSave={async (key, val) => handleSave(key, val)}
        />
        <InlineField label="Promedio Media" value={estudiante.promedios_media} fieldKey="promedios_media" type="number" editable={e} onSave={handleSave} />
        <InlineField label="Puntaje PAES" value={estudiante.puntaje_paes ?? '—'} fieldKey="puntaje_paes" type="number" editable={e} onSave={handleSave} />
      </Section>

      <Section title="Liceo de Origen">
        {liceo ? (
          <>
            <InlineField label="Nombre"    value={liceo.nombre}    readOnly />
            <InlineField label="RBD"       value={liceo.rbd}       fieldKey="rbd_liceo" editable={e} onSave={handleSave} />
            <InlineField label="Dirección" value={liceo.direccion} readOnly />
            <InlineField label="Comuna"    value={liceo.comuna}    readOnly />
            <InlineField label="Región"    value={liceo.region}    readOnly />
            <InlineField label="Teléfono"  value={liceo.telefono}  readOnly />
            <InlineField label="Email"     value={liceo.email}     readOnly />
          </>
        ) : (
          <div>
            <p className="text-sm text-gray-400 italic mb-2">Sin información de liceo asociada (RBD: {estudiante.rbd_liceo})</p>
            <InlineField label="RBD" value={estudiante.rbd_liceo} fieldKey="rbd_liceo" editable={e} onSave={handleSave} />
          </div>
        )}
      </Section>

      <Section title="Carrera">
        {carreraActual ? (
          <>
            <InlineField label="Nombre" value={carreraActual.nombre_carrera} readOnly />
            <InlineField label="Institución" value={carreraActual.institucion} readOnly />
            <InlineField label="Año de Ingreso" value={carreraActual.año_ingreso} readOnly />
            <InlineField label="Año de Egreso" value={carreraActual.año_egreso ?? '—'} readOnly />
            <InlineField label="Estado" value={carreraActual.activa ? 'Activa' : 'Finalizada'} readOnly />
            {carreraActual.observaciones && <InlineField label="Observaciones" value={carreraActual.observaciones} readOnly />}
          </>
        ) : (
          <p className="text-sm text-gray-400 italic">Sin carrera registrada</p>
        )}
      </Section>
    </div>
  );
}
