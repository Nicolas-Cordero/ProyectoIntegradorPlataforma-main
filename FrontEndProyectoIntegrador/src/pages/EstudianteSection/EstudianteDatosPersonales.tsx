import { useState, useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { estudianteService, paesService } from '../../services';
import type { EstudianteOutletContext } from './EstudianteDetail';
import type { UpdateEstudianteDto } from '../../services/estudiante.service';
import type { UpdatePaesDto } from '../../services/paes.service';
import type { Paes } from '../../types';
import {
  InfoCard,
  InlineField,
  PaesField,
  CreatePaesModal,
} from '../../components/features/estudiante-detalles/datos-personales';

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

      <InfoCard titulo="Información Personal" defaultExpanded>
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
        <InlineField label="Estado" value={estudiante.estado} readOnly />
        <InlineField label="Promedio Media" value={estudiante.promedios_media} fieldKey="promedios_media" type="number" editable={e} onSave={handleSave} />
      </InfoCard>

      <InfoCard titulo="Prueba PAES">
        {paesLoading ? (
          <p className="text-sm text-gray-400 italic py-3">Cargando puntajes...</p>
        ) : paes ? (
          <>
            <PaesField label="Competencia Lectora"        value={paes.lenguaje}     paesKey="lenguaje"     editable={e} onSave={handlePaesSave} />
            <PaesField label="Competencia Matemática M1"  value={paes.matematicas}  paesKey="matematicas"  editable={e} onSave={handlePaesSave} />
            <PaesField label="NEM"                        value={paes.nem}          paesKey="nem"          editable={e} onSave={handlePaesSave} />
            <PaesField label="Ranking"                    value={paes.ranking}      paesKey="ranking"      editable={e} onSave={handlePaesSave} />
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
