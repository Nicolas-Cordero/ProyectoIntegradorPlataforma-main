import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Avatar, Button, LinearProgress } from '@mui/material';
import { AccountCircle as AccountCircleIcon, CloudUpload as CloudUploadIcon, Edit as EditIcon } from '@mui/icons-material';
import { Modal, Input, Select, Alert } from '../../components/ui';
import { estadoAcademicoService, estudianteService } from '../../services';
import { getEstudianteStatus } from '../../utils/migration-helpers';
import type { EstudianteOutletContext } from './EstudianteDetail';
import type { StatusEstudiante, EstadoEstudiante, Genero } from '../../types';
import type { UpdateEstudianteDto } from '../../services/estudiante.service';

const STATUS_OPTIONS: { value: StatusEstudiante; label: string }[] = [
  { value: 'activo',   label: 'Activo'   },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'egresado', label: 'Egresado' },
  { value: 'retirado', label: 'Retirado' },
];

const STATUS_COLOR: Record<string, string> = {
  activo:   'bg-green-500',
  egresado: 'bg-blue-500',
  inactivo: 'bg-yellow-500',
  retirado: 'bg-red-500',
};

export default function EstudiantePerfil() {
  const { estudiante, liceo, generacion, canEdit, refresh } = useOutletContext<EstudianteOutletContext>();

  const statusInicial = getEstudianteStatus(estudiante) || 'activo';
  const [status, setStatus] = useState<StatusEstudiante>(statusInicial as StatusEstudiante);
  const [fotoUrl, setFotoUrl] = useState<string | undefined>(estudiante.foto_url);
  const [subiendo, setSubiendo] = useState(false);
  const [errorUpload, setErrorUpload] = useState('');
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UpdateEstudianteDto>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setStatus((getEstudianteStatus(estudiante) || 'activo') as StatusEstudiante);
    setFotoUrl(estudiante.foto_url);
  }, [estudiante]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as StatusEstudiante;
    const prev = status;
    setStatus(newStatus);
    setGuardandoEstado(true);
    try {
      await estadoAcademicoService.upsertByEstudiante(estudiante.rut_estudiante, { status: newStatus });
      (estudiante as any).status = newStatus;
    } catch {
      setStatus(prev);
    } finally {
      setGuardandoEstado(false);
    }
  };

  const openEditModal = () => {
    // Pre-cargar el formulario con los datos actuales del estudiante
    setEditForm({
      nombre:           estudiante.nombre,
      apellido:         estudiante.apellido,
      email:            estudiante.email,
      telefono:         estudiante.telefono,
      fecha_nacimiento: typeof estudiante.fecha_nacimiento === 'string'
        ? estudiante.fecha_nacimiento.split('T')[0]
        : estudiante.fecha_nacimiento?.toISOString().split('T')[0],
      direccion:        estudiante.direccion,
      genero:           estudiante.genero,
      rbd_liceo:        estudiante.rbd_liceo,
      puntaje_paes:     estudiante.puntaje_paes,
      promedios_media:  estudiante.promedios_media,
      estado:           estudiante.estado,
    });
    setSaveError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await estudianteService.update(estudiante.rut_estudiante, editForm);
      setModalOpen(false);
      refresh();
    } catch (err: any) {
      setSaveError(err?.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const carreraActual = estudiante.carreras?.[0] ?? null;

  const infoFields = [
    { label: 'Nombre Completo', value: `${estudiante.nombre} ${estudiante.apellido}` },
    { label: 'RUT',             value: estudiante.rut_estudiante },
    { label: 'Correo',          value: estudiante.email },
    { label: 'Teléfono',        value: estudiante.telefono },
    { label: 'Liceo',           value: liceo?.nombre ?? `RBD: ${estudiante.rbd_liceo}` },
    { label: 'Generación',      value: generacion ? `${generacion.año}${generacion.descripcion ? ` — ${generacion.descripcion}` : ''}` : `ID: ${estudiante.generacion_id ?? '—'}` },
    { label: 'Carrera',         value: carreraActual?.nombre_carrera ?? 'Sin carrera' },
    { label: 'Estado',          value: estudiante.estado },
  ];

  return (
    <div>
      {/* Tarjeta de perfil */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start">

          {/* Avatar, foto y selector de estado */}
          <div className="flex flex-col items-center gap-2">
            <Avatar
              sx={{ width: 160, height: 160, bgcolor: 'grey.300', fontSize: '4rem' }}
              src={fotoUrl}
              alt={estudiante.nombre}
            >
              {!fotoUrl && <AccountCircleIcon sx={{ fontSize: '7rem', color: 'grey.500' }} />}
            </Avatar>

            <input id="upload-avatar" type="file" accept="image/*" style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setErrorUpload('');
                setSubiendo(true);
                try {
                  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                  const preset   = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
                  const folder   = import.meta.env.VITE_CLOUDINARY_FOLDER || 'proyecto-integrador';
                  if (!cloudName || !preset) throw new Error('Faltan variables de Cloudinary');
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('upload_preset', preset);
                  formData.append('folder', folder);
                  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
                  if (!res.ok) throw new Error('Error subiendo imagen');
                  const data = await res.json();
                  const secureUrl = data.secure_url as string;
                  setFotoUrl(secureUrl);
                  await estudianteService.update(estudiante.rut_estudiante, { foto_url: secureUrl });
                } catch (err: any) {
                  setErrorUpload(err.message || 'No se pudo subir la imagen');
                } finally {
                  setSubiendo(false);
                  if (e.target) e.target.value = '';
                }
              }}
            />
            <label htmlFor="upload-avatar">
              <Button component="span" variant="outlined" startIcon={<CloudUploadIcon />} disabled={subiendo} sx={{ textTransform: 'none', mt: 1 }}>
                {subiendo ? 'Subiendo...' : 'Cambiar foto'}
              </Button>
            </label>
            {subiendo && <LinearProgress sx={{ width: '100%', mt: 1 }} />}
            {errorUpload && <p className="text-red-500 text-xs mt-1 text-center">{errorUpload}</p>}

            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-600 font-semibold">Estado:</span>
              <select
                value={status}
                onChange={handleStatusChange}
                disabled={guardandoEstado}
                className={`rounded-lg px-3 py-1 font-semibold text-white text-sm cursor-pointer disabled:opacity-60 ${STATUS_COLOR[status] ?? 'bg-gray-500'}`}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="text-black bg-white">{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Información General */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Información General</h2>
              {canEdit && (
                <button
                  onClick={openEditModal}
                  className="flex items-center gap-1.5 text-sm text-[#65B39B] hover:text-[#4a9e87] font-semibold transition-colors"
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                  Editar perfil
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infoFields.map(field => (
                <div key={field.label}>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{field.label}</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{field.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resumen Académico minimalista */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 max-w-lg mx-auto">
        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Resumen académico</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Promedio media</p>
            <p className="font-bold text-gray-800">
              {Number.isFinite(Number(estudiante.promedios_media)) ? Number(estudiante.promedios_media).toFixed(2) : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Semestre actual</p>
            {/* TODO: obtener desde periodoAcademicoService */}
            <p className="font-bold text-gray-800">—</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Beneficios</p>
            <p className="font-bold text-gray-800">
              {estudiante.beneficios?.length ? `${estudiante.beneficios.length} beneficio(s)` : 'Sin beneficios'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Estado académico</p>
            <p className="font-bold text-gray-800">{getEstudianteStatus(estudiante) || estudiante.estado || '—'}</p>
          </div>
        </div>
      </div>

      {/* Modal de edición — campos pre-cargados con datos actuales */}
      <Modal
        titulo="Editar perfil del estudiante"
        abierto={modalOpen}
        onCerrar={() => setModalOpen(false)}
        tamanio="md"
        acciones={
          <div className="flex gap-2 justify-end w-full">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-[#65B39B] text-white font-semibold hover:bg-[#4a9e87] disabled:opacity-50 transition-colors">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {saveError && (
            <div className="sm:col-span-2">
              <Alert tipo="error" mensaje={saveError} />
            </div>
          )}

          <Input
            etiqueta="Nombre"
            valor={editForm.nombre ?? ''}
            onChange={(v) => setEditForm(f => ({ ...f, nombre: v }))}
          />
          <Input
            etiqueta="Apellido"
            valor={editForm.apellido ?? ''}
            onChange={(v) => setEditForm(f => ({ ...f, apellido: v }))}
          />
          <Input
            etiqueta="Correo electrónico"
            tipo="email"
            valor={editForm.email ?? ''}
            onChange={(v) => setEditForm(f => ({ ...f, email: v }))}
          />
          <Input
            etiqueta="Teléfono"
            tipo="tel"
            valor={editForm.telefono ?? ''}
            onChange={(v) => setEditForm(f => ({ ...f, telefono: v }))}
            placeholder="+569 xxxx xxxx"
          />
          <Input
            etiqueta="Fecha de nacimiento"
            tipo="date"
            valor={editForm.fecha_nacimiento ?? ''}
            onChange={(v) => setEditForm(f => ({ ...f, fecha_nacimiento: v }))}
          />
          <Input
            etiqueta="Dirección"
            valor={editForm.direccion ?? ''}
            onChange={(v) => setEditForm(f => ({ ...f, direccion: v }))}
          />
          <Select
            etiqueta="Género"
            valor={editForm.genero ?? ''}
            onChange={(v) => setEditForm(f => ({ ...f, genero: v as Genero }))}
            opciones={[
              { valor: 'MASCULINO',  etiqueta: 'Masculino' },
              { valor: 'FEMENINO',   etiqueta: 'Femenino'  },
              { valor: 'NO_BINARIO', etiqueta: 'No binario' },
            ]}
          />
          <Select
            etiqueta="Estado"
            valor={editForm.estado ?? ''}
            onChange={(v) => setEditForm(f => ({ ...f, estado: v as EstadoEstudiante }))}
            opciones={[
              { valor: 'ACTIVO',      etiqueta: 'Activo'      },
              { valor: 'CONDICIONAL', etiqueta: 'Condicional' },
              { valor: 'SUSPENDIDO',  etiqueta: 'Suspendido'  },
              { valor: 'ELIMINADO',   etiqueta: 'Eliminado'   },
              { valor: 'RETIRADO',    etiqueta: 'Retirado'    },
              { valor: 'EGRESADO',    etiqueta: 'Egresado'    },
              { valor: 'TITULADO',    etiqueta: 'Titulado'    },
            ]}
          />
          <Input
            etiqueta="RBD Liceo"
            valor={editForm.rbd_liceo ?? ''}
            onChange={(v) => setEditForm(f => ({ ...f, rbd_liceo: v }))}
          />
          <Input
            etiqueta="Promedio media"
            tipo="number"
            valor={editForm.promedios_media?.toString() ?? ''}
            onChange={(v) => setEditForm(f => ({ ...f, promedios_media: Number(v) }))}
          />
          <Input
            etiqueta="Puntaje PAES"
            tipo="number"
            valor={editForm.puntaje_paes?.toString() ?? ''}
            onChange={(v) => setEditForm(f => ({ ...f, puntaje_paes: v ? Number(v) : undefined }))}
          />
        </div>
      </Modal>
    </div>
  );
}
