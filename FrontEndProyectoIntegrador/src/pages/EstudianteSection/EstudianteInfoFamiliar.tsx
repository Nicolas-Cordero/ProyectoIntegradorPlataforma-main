import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { familiarService } from '../../services';
import type { CreateFamiliarDto, UpdateFamiliarDto } from '../../services/familiar.service';
import { Modal, Input, Select, Alert } from '../../components/ui';
import { useConfirmDialog } from '../../components/ui';
import { useAuthContext } from '../../context/AuthContext';
import PermissionService from '../../services/permissionService';
import type { EstudianteOutletContext } from './EstudianteDetail';
import type { Familiar, Parentesco } from '../../types';
import { FamiliarCard } from '../../components/features/estudiante-detalles/info-familiar';

const PARENTESCO_OPTIONS: { value: Parentesco; label: string }[] = [
  { value: 'PADRE', label: 'Padre' },
  { value: 'MADRE', label: 'Madre' },
  { value: 'ABUELO', label: 'Abuelo' },
  { value: 'ABUELA', label: 'Abuela' },
  { value: 'HERMANO', label: 'Hermano/a' },
  { value: 'HERMANA', label: 'Hermana' },
  { value: 'TIO', label: 'Tío' },
  { value: 'TIA', label: 'Tía' },
  { value: 'PRIMO', label: 'Primo' },
  { value: 'PRIMA', label: 'Prima' },
  { value: 'OTRO', label: 'Otro' },
];

interface FormState {
  nombre: string;
  telefono: string;
  parentesco: Parentesco;
  observacion: string;
  es_contacto_emergencia: boolean;
}

const EMPTY_FORM: FormState = {
  nombre: '',
  telefono: '',
  parentesco: 'OTRO',
  observacion: '',
  es_contacto_emergencia: false,
};

export default function EstudianteInfoFamiliar() {
  const { estudiante, canEdit, refresh } = useOutletContext<EstudianteOutletContext>();
  const { usuario } = useAuthContext();
  const canDeleteFamiliar = PermissionService.puedeEliminarFamiliar(usuario);
  // Bug 7 fix: distinguir explícitamente undefined (no cargado) de [] (cargado y vacío)
  const familiaresRaw = estudiante.familiares;
  const familiares: Familiar[] = familiaresRaw ?? [];
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const contactoExistente = familiares.find(
    f => f.es_contacto_emergencia && f.id !== editingId
  ) ?? null;
  const checkboxBloqueado = contactoExistente !== null && !form.es_contacto_emergencia;

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (familiar: Familiar) => {
    setEditingId(familiar.id);
    setForm({
      nombre: familiar.nombre,
      telefono: familiar.telefono,
      parentesco: familiar.parentesco,
      observacion: familiar.observacion ?? '',
      es_contacto_emergencia: familiar.es_contacto_emergencia ?? false,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.telefono) {
      setError('Nombre y teléfono son obligatorios');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId !== null) {
        const update: UpdateFamiliarDto = {
          nombre: form.nombre,
          telefono: form.telefono,
          parentesco: form.parentesco,
          observacion: form.observacion || undefined,
          es_contacto_emergencia: form.es_contacto_emergencia,
        };
        await familiarService.update(editingId, update);
      } else {
        const create: CreateFamiliarDto = {
          rut_estudiante: estudiante.rut_estudiante,
          nombre: form.nombre,
          telefono: form.telefono,
          parentesco: form.parentesco,
          observacion: form.observacion || undefined,
          es_contacto_emergencia: form.es_contacto_emergencia,
        };
        await familiarService.create(create);
      }
      setModalOpen(false);
      refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    showConfirm({
      title: 'Eliminar familiar',
      message: '¿Estás seguro de que deseas eliminar este familiar? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      confirmColor: 'error',
      onConfirm: async () => {
        await familiarService.delete(id);
        refresh();
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Información Familiar</h2>
          <p className="text-base font-medium text-gray-600 mt-1.5">
            {familiaresRaw === undefined
              ? 'Cargando información familiar...'
              : familiares.length > 0
                ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-[#65B39B]/15 text-[#3a7a6b] rounded-full">
                      {familiares.length}
                    </span>
                    familiar{familiares.length > 1 ? 'es' : ''} registrado{familiares.length > 1 ? 's' : ''}
                  </span>
                )
                : 'Sin familiares registrados'}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#65B39B] text-white text-sm font-semibold rounded-xl hover:bg-[#4a9e87] transition-colors"
          >
            + Agregar familiar
          </button>
        )}
      </div>

      {/* Bug 7 fix: tres estados diferenciados */}
      {familiaresRaw === undefined ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 font-medium">Los datos de familiares no están disponibles en este momento.</p>
        </div>
      ) : familiares.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-3">👨‍👩‍👧‍👦</p>
          <p className="text-gray-500 font-medium">No hay familiares registrados para este estudiante.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {familiares.map(familiar => (
            <FamiliarCard
              key={familiar.id}
              familiar={familiar}
              canEdit={canEdit}
              canDelete={canDeleteFamiliar}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        titulo={editingId !== null ? 'Editar familiar' : 'Agregar familiar'}
        abierto={modalOpen}
        onCerrar={() => setModalOpen(false)}
        tamanio="sm"
        acciones={
          <div className="flex gap-2 justify-end w-full">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-[#65B39B] text-white font-semibold hover:bg-[#4a9e87] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          {error && <Alert tipo="error" mensaje={error} />}
          {/*fix muy cutre*/}
          <p></p>
          <Input
            etiqueta="Nombre"
            valor={form.nombre}
            onChange={(v) => setForm(f => ({ ...f, nombre: v }))}
          />
          <Input
            etiqueta="Teléfono"
            tipo="tel"
            valor={form.telefono}
            onChange={(v) => setForm(f => ({ ...f, telefono: v }))}
            placeholder="+569 xxxx xxxx"
          />
          <Select
            etiqueta="Parentesco"
            valor={form.parentesco}
            onChange={(v) => setForm(f => ({ ...f, parentesco: v as Parentesco }))}
            opciones={PARENTESCO_OPTIONS.map(o => ({ valor: o.value, etiqueta: o.label }))}
          />
          {/*fix muy cutre*/}
          <p></p>
          <Input
            etiqueta="Observación (opcional)"
            valor={form.observacion}
            onChange={(v) => setForm(f => ({ ...f, observacion: v }))}
          />
          <div className="pt-1">
            <label className={`flex items-start gap-3 cursor-pointer ${checkboxBloqueado ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input
                type="checkbox"
                checked={form.es_contacto_emergencia}
                disabled={checkboxBloqueado}
                onChange={(e) => setForm(f => ({ ...f, es_contacto_emergencia: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#65B39B] focus:ring-[#65B39B]"
              />
              <span className="text-sm font-medium text-gray-700">Contacto de emergencia</span>
            </label>
            {checkboxBloqueado && contactoExistente && (
              <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Ya hay un contacto de emergencia: <strong>{contactoExistente.nombre}</strong>. Edítalo para cambiar la designación.
              </p>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog />
    </div>
  );
}
