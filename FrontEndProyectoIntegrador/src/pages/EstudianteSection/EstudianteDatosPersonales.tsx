import { useState, useRef, useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { estudianteService, paesService } from '../../services';
import { Modal, Input, Alert, Button } from '../../components/ui';
import type { EstudianteOutletContext } from './EstudianteDetail';
import type { UpdateEstudianteDto } from '../../services/estudiante.service';
import type { UpdatePaesDto, CreatePaesDto } from '../../services/paes.service';
import type { Paes } from '../../types';

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

function InfoCard({ titulo, children, defaultExpanded = false }: { titulo: string; children: ReactNode; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        aria-expanded={expanded}
      >
        <h2 className="text-lg font-bold text-gray-800">{titulo}</h2>
        <span
          className="text-gray-400 text-lg transition-transform duration-200"
          style={{ display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>
      {expanded && (
        <div className="px-6 pb-5 pt-1 border-t border-gray-100">
          {children}
        </div>
      )}
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
  const [displayOverride, setDisplayOverride] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  const baseValue = displayOverride ?? (value !== null && value !== undefined ? String(value) : 'No especificado');

  const startEdit = () => {
    if (!editable || readOnly || !fieldKey) return;
    setDraft(value !== null && value !== undefined ? String(value) : '');
    setEditing(true);
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
  };

  const save = async () => {
    if (!fieldKey || !onSave) { setEditing(false); return; }
    const ok = await onSave(fieldKey, draft);
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

type PaesFieldKey = keyof UpdatePaesDto;

interface PaesFieldProps {
  label: string;
  value: number | undefined | null;
  paesKey?: PaesFieldKey;
  editable?: boolean;
  onSave?: (key: PaesFieldKey, value: string) => Promise<boolean>;
}

function PaesField({ label, value, paesKey, editable, onSave }: PaesFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [displayOverride, setDisplayOverride] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const baseValue = displayOverride ?? (value !== null && value !== undefined ? String(value) : 'No especificado');

  const startEdit = () => {
    if (!editable || !paesKey) return;
    setDraft(value !== null && value !== undefined ? String(value) : '');
    setEditing(true);
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
  };

  const save = async () => {
    if (!paesKey || !onSave) { setEditing(false); return; }
    const ok = await onSave(paesKey, draft);
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
      {editing && paesKey ? (
        <input
          ref={inputRef}
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={onKeyDown}
          className="text-base border-2 border-[#65B39B] rounded-md px-2 py-1.5 focus:outline-none w-full max-w-xs"
        />
      ) : (
        <span
          onDoubleClick={startEdit}
          title={editable ? 'Doble clic para editar' : undefined}
          className={`text-base font-semibold text-gray-800 select-none ${
            editable
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

const INPUT_CLASS =
  'w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B] bg-white transition-colors';

const LABEL_CLASS = 'block text-xs font-semibold text-gray-600 mb-1';

interface CreatePaesModalProps {
  open: boolean;
  rutEstudiante: string;
  onClose: () => void;
  onSuccess: (paes: Paes) => void;
}

function CreatePaesModal({ open, rutEstudiante, onClose, onSuccess }: CreatePaesModalProps) {
  const EMPTY = { lenguaje: '', matematicas: '', nem: '', ranking: '', matematicas2: '', ciencias: '', historia: '' };
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setForm(EMPTY); setError(''); }
  }, [open]);

  const set = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = (): string => {
    if (!form.lenguaje) return 'Competencia Lectora es obligatoria.';
    if (isNaN(Number(form.lenguaje))) return 'Competencia Lectora debe ser un número.';
    if (!form.matematicas) return 'Competencia Matemática M1 es obligatoria.';
    if (isNaN(Number(form.matematicas))) return 'Competencia Matemática M1 debe ser un número.';
    if (!form.nem) return 'NEM es obligatorio.';
    if (isNaN(Number(form.nem))) return 'NEM debe ser un número.';
    if (!form.ranking) return 'Ranking es obligatorio.';
    if (isNaN(Number(form.ranking))) return 'Ranking debe ser un número.';
    if (form.matematicas2 && isNaN(Number(form.matematicas2))) return 'Competencia Matemática M2 debe ser un número.';
    if (form.ciencias && isNaN(Number(form.ciencias))) return 'Ciencias debe ser un número.';
    if (form.historia && isNaN(Number(form.historia))) return 'Historia y Ciencias Sociales debe ser un número.';
    return '';
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    try {
      const dto: CreatePaesDto = {
        rut_estudiante: rutEstudiante,
        lenguaje: Number(form.lenguaje),
        matematicas: Number(form.matematicas),
        nem: Number(form.nem),
        ranking: Number(form.ranking),
        ...(form.matematicas2 ? { matematicas2: Number(form.matematicas2) } : {}),
        ...(form.ciencias ? { ciencias: Number(form.ciencias) } : {}),
        ...(form.historia ? { historia: Number(form.historia) } : {}),
      };
      const result = await paesService.createPaes(dto);
      onSuccess(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al registrar los puntajes PAES.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      titulo="Registrar Puntajes PAES"
      abierto={open}
      onCerrar={() => { if (!loading) onClose(); }}
      tamanio="md"
      acciones={
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <Button variante="outline" tamano="md" onClick={onClose} deshabilitado={loading}>
            Cancelar
          </Button>
          <Button variante="primary" tamano="md" onClick={handleSubmit} cargando={loading}>
            Registrar
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && (
          <Alert tipo="error" mensaje={error} cerrable onCerrar={() => setError('')} />
        )}

        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#65B39B', mt: 0.5 }}>
          Puntajes obligatorios
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <div>
            <label className={LABEL_CLASS}>Competencia Lectora *</label>
            <input type="number" value={form.lenguaje} onChange={set('lenguaje')} disabled={loading} placeholder="ej: 600" className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Competencia Matemática M1 *</label>
            <input type="number" value={form.matematicas} onChange={set('matematicas')} disabled={loading} placeholder="ej: 550" className={INPUT_CLASS} />
          </div>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <div>
            <label className={LABEL_CLASS}>NEM *</label>
            <input type="number" value={form.nem} onChange={set('nem')} disabled={loading} placeholder="ej: 650" className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Ranking *</label>
            <input type="number" value={form.ranking} onChange={set('ranking')} disabled={loading} placeholder="ej: 700" className={INPUT_CLASS} />
          </div>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#65B39B' }}>
          Puntajes opcionales
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          <div>
            <label className={LABEL_CLASS}>Matemática M2</label>
            <input type="number" value={form.matematicas2} onChange={set('matematicas2')} disabled={loading} placeholder="ej: 500" className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Ciencias</label>
            <input type="number" value={form.ciencias} onChange={set('ciencias')} disabled={loading} placeholder="ej: 500" className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Historia y Cs. Sociales</label>
            <input type="number" value={form.historia} onChange={set('historia')} disabled={loading} placeholder="ej: 500" className={INPUT_CLASS} />
          </div>
        </Box>
      </Box>
    </Modal>
  );
}

export default function EstudianteDatosPersonales() {
  const { estudiante, liceo, generacion, canEdit } = useOutletContext<EstudianteOutletContext>();
  const [saveError, setSaveError] = useState('');
  const [paes, setPaes] = useState<Paes | null>(null);
  const [paesLoading, setPaesLoading] = useState(true);
  const [showCreatePaes, setShowCreatePaes] = useState(false);

  const carreraActual = estudiante.carreras?.[0] ?? null;
  const contactoEmergencia = estudiante.familiares?.find(f => f.es_contacto_emergencia) ?? null;
  const generacionLabel = generacion
    ? `${generacion.año}${generacion.descripcion ? ` — ${generacion.descripcion}` : ''}`
    : 'No especificado';

  useEffect(() => {
    setPaesLoading(true);
    paesService.getPaesByEstudiante(estudiante.rut_estudiante)
      .then(data => setPaes(data))
      .catch(() => setPaes(null))
      .finally(() => setPaesLoading(false));
  }, [estudiante.rut_estudiante]);

  const handleSave = useCallback(async (key: keyof UpdateEstudianteDto, rawValue: string): Promise<boolean> => {
    setSaveError('');
    let value: string | number | undefined = rawValue;
    if (key === 'promedios_media') {
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

  const handlePaesSave = useCallback(async (key: keyof UpdatePaesDto, rawValue: string): Promise<boolean> => {
    setSaveError('');
    const value = rawValue ? Number(rawValue) : undefined;
    try {
      const updated = await paesService.updatePaes(estudiante.rut_estudiante, { [key]: value });
      setPaes(updated);
      return true;
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar el puntaje PAES');
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

      {canEdit && (
        <div className="mb-4 flex items-center gap-2 bg-[#65B39B]/10 border border-[#65B39B]/30 rounded-xl px-4 py-2.5 text-sm text-[#3a7a6b]">
          <span className="text-base">✏️</span>
          <span>Doble clic sobre cualquier campo resaltado para editarlo · <kbd className="bg-white border border-gray-300 rounded px-1 text-xs">Enter</kbd> para guardar · <kbd className="bg-white border border-gray-300 rounded px-1 text-xs">Esc</kbd> para cancelar</span>
        </div>
      )}

      <InfoCard titulo="Información Personal" defaultExpanded={true}>
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
      </InfoCard>

      <InfoCard titulo="Información Académica">
        <InlineField label="Generación"    value={generacionLabel} readOnly />
        <InlineField label="Estado"        value={estudiante.estado} fieldKey="estado" editable={e}
          type="select"
          options={[
            { value: 'ACTIVO',     label: 'Activo'     },
            { value: 'SUSPENDIDO', label: 'Suspendido' },
            { value: 'ELIMINADO',   label: 'Eliminado'   },
            { value: 'RETIRADO',    label: 'Retirado'    },
            { value: 'EGRESADO',    label: 'Egresado'    },
            { value: 'TITULADO',    label: 'Titulado'    },
          ]}
          onSave={handleSave}
        />
        <InlineField label="Promedio Media" value={estudiante.promedios_media} fieldKey="promedios_media" type="number" editable={e} onSave={handleSave} />
      </InfoCard>

      <InfoCard titulo="Prueba PAES">
        {paesLoading ? (
          <p className="text-sm text-gray-400 italic py-3">Cargando puntajes...</p>
        ) : paes ? (
          <>
            <PaesField label="Competencia Lectora"      value={paes.lenguaje}     paesKey="lenguaje"     editable={e} onSave={handlePaesSave} />
            <PaesField label="Competencia Matemática M1" value={paes.matematicas}  paesKey="matematicas"  editable={e} onSave={handlePaesSave} />
            <PaesField label="NEM"                       value={paes.nem}          paesKey="nem"          editable={e} onSave={handlePaesSave} />
            <PaesField label="Ranking"                   value={paes.ranking}      paesKey="ranking"      editable={e} onSave={handlePaesSave} />
            {paes.matematicas2 != null && (
              <PaesField label="Competencia Matemática M2" value={paes.matematicas2} paesKey="matematicas2" editable={e} onSave={handlePaesSave} />
            )}
            {paes.ciencias != null && (
              <PaesField label="Ciencias"                   value={paes.ciencias}    paesKey="ciencias"     editable={e} onSave={handlePaesSave} />
            )}
            {paes.historia != null && (
              <PaesField label="Historia y Ciencias Sociales" value={paes.historia}  paesKey="historia"     editable={e} onSave={handlePaesSave} />
            )}
          </>
        ) : (
          <div className="py-3">
            <p className="text-sm text-gray-500 italic mb-3">Sin prueba PAES registrada.</p>
            {e && (
              <button
                onClick={() => setShowCreatePaes(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#65B39B] rounded-lg hover:bg-[#4a9a83] transition-colors"
              >
                Registrar puntajes PAES
              </button>
            )}
          </div>
        )}
      </InfoCard>

      <InfoCard titulo="Liceo de Origen">
        {liceo ? (
          <>
            <InlineField label="Nombre"      value={liceo.nombre}       readOnly />
            <InlineField label="RBD"         value={liceo.rbd}          readOnly />
            <InlineField label="Comuna"      value={liceo.comuna}       readOnly />
            <InlineField label="Especialidad" value={liceo.especialidad} readOnly />
          </>
        ) : (
          <div>
            <p className="text-sm text-gray-400 italic mb-3">No se encontró información del liceo (RBD: {estudiante.rbd_liceo})</p>
            <InlineField label="RBD" value={estudiante.rbd_liceo} fieldKey="rbd_liceo" editable={e} onSave={handleSave} />
          </div>
        )}
      </InfoCard>

      <InfoCard titulo="Carrera">
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
      </InfoCard>

      <InfoCard titulo="Contacto de Emergencia">
        {contactoEmergencia ? (
          <>
            <InlineField label="Nombre"      value={contactoEmergencia.nombre}                              readOnly />
            <InlineField label="Parentesco"  value={contactoEmergencia.parentesco}                          readOnly />
            <InlineField label="Teléfono"    value={contactoEmergencia.telefono}                            readOnly />
            <InlineField label="RUT"         value={contactoEmergencia.rut_familiar}                        readOnly />
            {contactoEmergencia.observacion && (
              <InlineField label="Observación" value={contactoEmergencia.observacion} readOnly />
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400 italic">Sin contacto de emergencia designado</p>
        )}
      </InfoCard>

      <CreatePaesModal
        open={showCreatePaes}
        rutEstudiante={estudiante.rut_estudiante}
        onClose={() => setShowCreatePaes(false)}
        onSuccess={(newPaes) => {
          setPaes(newPaes);
          setShowCreatePaes(false);
        }}
      />
    </div>
  );
}
