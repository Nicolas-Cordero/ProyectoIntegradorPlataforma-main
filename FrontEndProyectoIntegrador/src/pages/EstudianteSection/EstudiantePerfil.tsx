import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Avatar } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { Modal, Input, Select, Alert, Button } from '../../components/ui';
import { estudianteService, alertasService } from '../../services';
import type { Alerta } from '../../services';
import type { EstudianteOutletContext } from './EstudianteDetail';
import type { Genero } from '../../types';
import type { UpdateEstudianteDto } from '../../services/estudiante.service';
import { FotoPerfilModal } from '../../components/features/estudiante-detalles/FotoPerfilModal';
import userSvg from '../../assets/icons/user.svg';

// Normaliza coma decimal a punto antes de cualquier operación numérica (Bug 10)
function normalizarDecimal(v: string | number | undefined | null): string {
  if (v === null || v === undefined) return '';
  return String(v).replace(',', '.');
}

export default function EstudiantePerfil() {
  const { estudiante, liceo, generacion, canEdit, refresh } = useOutletContext<EstudianteOutletContext>();

  const [fotoUrl, setFotoUrl] = useState<string | undefined>(estudiante.foto_url);
  const [fotoModalOpen, setFotoModalOpen] = useState(false);

  const [alertas, setAlertas] = useState<Alerta[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UpdateEstudianteDto>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setFotoUrl(estudiante.foto_url);
  }, [estudiante]);

  useEffect(() => {
    alertasService.getAlertasByEstudiante(estudiante.rut_estudiante)
      .then(setAlertas)
      .catch(() => setAlertas([]));
  }, [estudiante.rut_estudiante]);

  const openEditModal = () => {
    // Bug 10 fix: normalizar promedios_media (puede llegar con coma decimal del backend)
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
      promedios_media:  parseFloat(normalizarDecimal(estudiante.promedios_media)) || 0,
    });
    setSaveError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      // Bug 10 fix: asegurar punto decimal antes de enviar
      const payload = {
        ...editForm,
        promedios_media: editForm.promedios_media !== undefined
          ? parseFloat(normalizarDecimal(editForm.promedios_media))
          : undefined,
      };
      await estudianteService.update(estudiante.rut_estudiante, payload);
      setModalOpen(false);
      refresh();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  //Incluir el estado de la carrera.
  const carreraActual = estudiante.carreras?.[0] ?? null;

  const infoFields = [
    { label: 'Nombre Completo', value: `${estudiante.nombre} ${estudiante.apellido}` },
    { label: 'RUT',             value: estudiante.rut_estudiante },
    { label: 'Correo',          value: estudiante.email },
    { label: 'Teléfono',        value: estudiante.telefono },
    { label: 'Liceo',           value: liceo?.nombre ?? `RBD: ${estudiante.rbd_liceo}` },
    { label: 'Generación',      value: generacion ? `${generacion.año}${generacion.descripcion ? ` — ${generacion.descripcion}` : ''}` : `ID: ${estudiante.generacion_id ?? '—'}` },
    { label: 'Carrera',         value: carreraActual?.nombre ?? 'Sin carrera' },
    // Bug 8 fix: etiqueta clara para distinguir del estado académico
    { label: 'Estado en sistema', value: estudiante.estado },
  ];

  return (
    <div>
      {/* Tarjeta de perfil */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start">

          {/* Avatar y foto */}
          <div className="flex flex-col items-center gap-2">
            <Avatar
              sx={{ width: 160, height: 160, bgcolor: 'grey.200' }}
              src={fotoUrl || userSvg}
              alt={estudiante.nombre}
            />

            {canEdit && (
              <Button variante="outline" tamano="sm" onClick={() => setFotoModalOpen(true)}>
                Cambiar foto
              </Button>
            )}

            <FotoPerfilModal
              estudianteId={estudiante.rut_estudiante}
              isOpen={fotoModalOpen}
              onClose={() => setFotoModalOpen(false)}
              onSuccess={(url) => setFotoUrl(url)}
            />
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
                  {/* Bug 6 fix: ?? en lugar de || para que 0 no sea falsy */}
                  <p className="font-semibold text-gray-800 mt-0.5">{field.value ?? 'No especificado'}</p>
                </div>
              ))}
            </div>

            {alertas.length > 0 && (
              <div className="mt-4 space-y-2">
                {alertas.map((alerta, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
                  >
                    <span className="font-bold text-amber-600">!</span>
                    <span>{alerta.message}</span>
                  </div>
                ))}
              </div>
            )}
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
              {Number.isFinite(parseFloat(normalizarDecimal(estudiante.promedios_media)))
                ? parseFloat(normalizarDecimal(estudiante.promedios_media)).toFixed(2)
                : '—'}
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
            <p className="font-bold text-gray-800">{estudiante.estado || '—'}</p>
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
        {/* Bug 11 fix: padding superior para que los primeros campos no queden cortados */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {saveError && (
            <div className="sm:col-span-2">
              <Alert tipo="error" mensaje={saveError} />
            </div>
          )}
          <Input etiqueta="Nombre"     valor={editForm.nombre ?? ''}    onChange={(v) => setEditForm(f => ({ ...f, nombre: v }))} />
          <Input etiqueta="Apellido"   valor={editForm.apellido ?? ''}  onChange={(v) => setEditForm(f => ({ ...f, apellido: v }))} />
          <Input etiqueta="Correo"     tipo="email" valor={editForm.email ?? ''}   onChange={(v) => setEditForm(f => ({ ...f, email: v }))} />
          <Input etiqueta="Teléfono"   tipo="tel"   valor={editForm.telefono ?? ''} onChange={(v) => setEditForm(f => ({ ...f, telefono: v }))} placeholder="+569 xxxx xxxx" />
          <Input etiqueta="Fecha de nacimiento" tipo="date" valor={editForm.fecha_nacimiento ?? ''} onChange={(v) => setEditForm(f => ({ ...f, fecha_nacimiento: v }))} />
          <Input etiqueta="Dirección"  valor={editForm.direccion ?? ''} onChange={(v) => setEditForm(f => ({ ...f, direccion: v }))} />
          <Select
            etiqueta="Género"
            valor={editForm.genero ?? ''}
            onChange={(v) => setEditForm(f => ({ ...f, genero: v as Genero }))}
            opciones={[
              { valor: 'MASCULINO',  etiqueta: 'Masculino'  },
              { valor: 'FEMENINO',   etiqueta: 'Femenino'   },
              { valor: 'NO_BINARIO', etiqueta: 'No binario' },
            ]}
          />
          <Input etiqueta="RBD Liceo" valor={editForm.rbd_liceo ?? ''} onChange={(v) => setEditForm(f => ({ ...f, rbd_liceo: v }))} />
          <Input
            etiqueta="Promedio media"
            tipo="number"
            valor={editForm.promedios_media?.toString() ?? ''}
            onChange={(v) => setEditForm(f => ({ ...f, promedios_media: parseFloat(normalizarDecimal(v)) || 0 }))}
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
