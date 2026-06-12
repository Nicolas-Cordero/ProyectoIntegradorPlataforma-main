import { useState, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ReactNode } from 'react';
import { estudianteService } from '../../services';
import type { EstudianteOutletContext } from './EstudianteDetail';
import type { UpdateEstudianteDto } from '../../services/estudiante.service';

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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
      <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">{title}</h2>
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
  onSave?: (key: keyof UpdateEstudianteDto, value: string) => Promise<boolean>;
}

function InlineField({ label, value, fieldKey, type = 'text', options, editable, readOnly, onSave }: InlineFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  // Bug 14 fix: guardamos el valor optimista localmente para evitar re-fetch y scroll
  const [displayOverride, setDisplayOverride] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  // Bug 13 fix: usar "No especificado" en lugar de guión
  const baseValue = displayOverride ?? (value !== null && value !== undefined ? String(value) : 'No especificado');

  const startEdit = () => {
    if (!editable || readOnly || !fieldKey) return;
    setDraft(value !== null && value !== undefined ? String(value) : '');
    setEditing(true);
    // Bug 14 fix: preventScroll para no desplazar la página al enfocar el input
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
  };

  const save = async () => {
    if (!fieldKey || !onSave) { setEditing(false); return; }
    const ok = await onSave(fieldKey, draft);
    // Bug 14 fix: actualización optimista local, sin llamar refresh() del padre
    if (ok) setDisplayOverride(draft || 'No especificado');
    setEditing(false);
  };

  const cancel = () => {
    setEditing(false);
    setDraft('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); save(); }
    if (e.key === 'Escape') cancel();
  };

  return (
    <div className="py-3 grid grid-cols-[210px_1fr] gap-4 items-center border-b border-gray-50 last:border-0 group">
      <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">{label}</span>
      {editing && fieldKey ? (
        options ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={onKeyDown}
            className="text-base border-2 border-[#65B39B] rounded-md px-2 py-1.5 focus:outline-none w-full max-w-xs"
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
            className="text-base border-2 border-[#65B39B] rounded-md px-2 py-1.5 focus:outline-none w-full max-w-xs"
          />
        )
      ) : (
        <span
          onDoubleClick={startEdit}
          title={editable && !readOnly ? 'Doble clic para editar' : undefined}
          className={`text-base font-semibold text-gray-800 select-none ${
            editable && !readOnly
              ? 'cursor-pointer rounded px-1 -mx-1 group-hover:bg-[#65B39B]/10 group-hover:text-[#3a7a6b] transition-colors'
              : ''
          }`}
        >
          {baseValue}
        </span>
      )}
    </div>
  );
}

export default function EstudianteDatosPersonales() {
  const { estudiante, liceo, generacion, canEdit } = useOutletContext<EstudianteOutletContext>();
  const [saveError, setSaveError] = useState('');
  //const carreraActual = estudiante.carreras?.find(c => c.activa) ?? estudiante.carreras?.[0] ?? null; CORREGIR DEBIDO A QUE HAY QUE INCLUIR EL ESTADO DE LA CARRERA
  const carreraActual = estudiante.carreras?.[0] ?? null;
  const contactoEmergencia = estudiante.familiares?.find(f => f.es_contacto_emergencia) ?? null;
  const generacionLabel = generacion
    ? `${generacion.año}${generacion.descripcion ? ` — ${generacion.descripcion}` : ''}`
    : 'No especificado';

  // Bug 14 fix: no llamar refresh() desde aquí — el campo actualiza su estado localmente
  const handleSave = useCallback(async (key: keyof UpdateEstudianteDto, rawValue: string): Promise<boolean> => {
    setSaveError('');
    let value: string | number | undefined = rawValue;
    if (key === 'promedios_media' || key === 'puntaje_paes') {
      value = rawValue ? Number(rawValue.replace(',', '.')) : undefined;
    }
    try {
      await estudianteService.update(estudiante.rut_estudiante, { [key]: value });
      return true;
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar el campo');
      return false;
    }
  }, [estudiante.rut_estudiante]);

  const e = canEdit;

  return (
    <div>
      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700" role="alert">
          {saveError}
        </div>
      )}

      {/* Bug 12 fix: banner de ayuda más visible con ícono */}
      {canEdit && (
        <div className="mb-4 flex items-center gap-2 bg-[#65B39B]/10 border border-[#65B39B]/30 rounded-xl px-4 py-2.5 text-sm text-[#3a7a6b]">
          <span className="text-base">✏️</span>
          <span>Doble clic sobre cualquier campo resaltado para editarlo · <kbd className="bg-white border border-gray-300 rounded px-1 text-xs">Enter</kbd> para guardar · <kbd className="bg-white border border-gray-300 rounded px-1 text-xs">Esc</kbd> para cancelar</span>
        </div>
      )}

      <Section title="Información Personal">
        <InlineField label="Nombre"              value={estudiante.nombre}                fieldKey="nombre"    editable={e} onSave={handleSave} />
        <InlineField label="Apellido"             value={estudiante.apellido}              fieldKey="apellido"  editable={e} onSave={handleSave} />
        <InlineField label="RUT"                  value={estudiante.rut_estudiante}        readOnly />
        <InlineField label="Fecha de Nacimiento"  value={formatFecha(estudiante.fecha_nacimiento)} readOnly />
        <InlineField label="Edad"                 value={calcularEdad(estudiante.fecha_nacimiento)} readOnly />
        <InlineField label="Género"               value={estudiante.genero}                fieldKey="genero"    editable={e}
          type="select"
          options={[
            { value: 'MASCULINO',  label: 'Masculino'  },
            { value: 'FEMENINO',   label: 'Femenino'   },
            { value: 'NO_BINARIO', label: 'No binario' },
          ]}
          onSave={handleSave}
        />
        <InlineField label="Dirección"            value={estudiante.direccion}             fieldKey="direccion" editable={e} onSave={handleSave} />
        <InlineField label="Correo Electrónico"   value={estudiante.email}                 fieldKey="email"     type="email" editable={e} onSave={handleSave} />
        <InlineField label="Teléfono"             value={estudiante.telefono}              fieldKey="telefono"  type="tel"   editable={e} onSave={handleSave} />
      </Section>

      <Section title="Información Académica">
        <InlineField label="Generación"    value={generacionLabel} readOnly />
        <InlineField label="Estado"        value={estudiante.estado} fieldKey="estado" editable={e}
          type="select"
          options={[
            { value: 'ACTIVO',      label: 'Activo'      },
            { value: 'CONDICIONAL', label: 'Condicional' },
            { value: 'SUSPENDIDO',  label: 'Suspendido'  },
            { value: 'ELIMINADO',   label: 'Eliminado'   },
            { value: 'RETIRADO',    label: 'Retirado'    },
            { value: 'EGRESADO',    label: 'Egresado'    },
            { value: 'TITULADO',    label: 'Titulado'    },
          ]}
          onSave={handleSave}
        />
        <InlineField label="Promedio Media" value={estudiante.promedios_media} fieldKey="promedios_media" type="number" editable={e} onSave={handleSave} />
        <InlineField label="Puntaje PAES"   value={estudiante.puntaje_paes ?? 'No especificado'} fieldKey="puntaje_paes" type="number" editable={e} onSave={handleSave} />
      </Section>

      <Section title="Liceo de Origen">
        {liceo ? (
          <>
            <InlineField label="Nombre"    value={liceo.nombre}       readOnly />
            <InlineField label="RBD"       value={liceo.rbd}          readOnly />
            <InlineField label="Comuna"    value={liceo.comuna}       readOnly />
            <InlineField label="Comuna"    value={liceo.especialidad} readOnly />
          </>
        ) : (
          <div>
            <p className="text-sm text-gray-400 italic mb-3">No se encontró información del liceo (RBD: {estudiante.rbd_liceo})</p>
            <InlineField label="RBD" value={estudiante.rbd_liceo} fieldKey="rbd_liceo" editable={e} onSave={handleSave} />
          </div>
        )}
      </Section>

      <Section title="Carrera">
        {carreraActual ? (
          <>
            <InlineField label="Nombre"         value={carreraActual.nombre}          readOnly />
            <InlineField label="Institución"    value={'fixear'} readOnly />
            <InlineField label="Año de Ingreso" value={'fixear (incluir año ingreso)'} readOnly />
            <InlineField label="Duración"       value={carreraActual.duracion_sem} readOnly />
            <InlineField label="Estado"         value={'fixear (incluir estado)'} readOnly />
          </>
        ) : (
          <p className="text-sm text-gray-400 italic">Sin carrera registrada</p>
        )}
      </Section>

      <Section title="Contacto de Emergencia">
        {contactoEmergencia ? (
          <>
            <InlineField label="Nombre"     value={contactoEmergencia.nombre}                              readOnly />
            <InlineField label="Parentesco" value={contactoEmergencia.parentesco}                          readOnly />
            <InlineField label="Teléfono"   value={contactoEmergencia.telefono}                            readOnly />
            <InlineField label="RUT"        value={contactoEmergencia.rut_familiar}                        readOnly />
            {contactoEmergencia.observacion && (
              <InlineField label="Observación" value={contactoEmergencia.observacion} readOnly />
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400 italic">Sin contacto de emergencia designado</p>
        )}
      </Section>
    </div>
  );
}
