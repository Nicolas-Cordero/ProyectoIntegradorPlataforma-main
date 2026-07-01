import { Modal, Input, Select, Alert } from '../../../ui';
import type { EstadoRamoAvance } from '../../../../services/ramo-avance.service';
import { ESTADO_RAMO_OPTS } from './constants';

export interface FormRamo {
  nombre: string;
  estado: EstadoRamoAvance;
  comentario: string;
  intento: string;
  nota_final: string;
}

interface ModalRamoProps {
  abierto: boolean;
  esEdicion: boolean;
  onCerrar: () => void;
  form: FormRamo;
  setForm: (fn: (f: FormRamo) => FormRamo) => void;
  error: string;
  guardando: boolean;
  onGuardar: () => void;
}

export function ModalRamo({ abierto, esEdicion, onCerrar, form, setForm, error, guardando, onGuardar }: ModalRamoProps) {
  return (
    <Modal
      titulo={esEdicion ? 'Editar ramo' : 'Nuevo ramo'}
      abierto={abierto}
      onCerrar={onCerrar}
      tamanio="sm"
      acciones={
        <div className="flex gap-2 justify-end w-full">
          <button onClick={onCerrar} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={onGuardar}
            disabled={guardando}
            className="px-4 py-2 text-sm rounded-lg bg-[#65B39B] text-white font-semibold hover:bg-[#4a9e87] disabled:opacity-50 transition-colors"
          >
            {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Agregar ramo'}
          </button>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {error && <Alert tipo="error" mensaje={error} />}
        <Input
          etiqueta="Nombre del ramo"
          valor={form.nombre}
          onChange={v => setForm(f => ({ ...f, nombre: v }))}
          placeholder="Ej: Cálculo I"
        />
        <Select
          etiqueta="Estado"
          valor={form.estado}
          onChange={v => setForm(f => ({ ...f, estado: v as EstadoRamoAvance }))}
          opciones={ESTADO_RAMO_OPTS.map(o => ({ valor: o.valor, etiqueta: o.etiqueta }))}
        />
        <Input
          etiqueta="Intento"
          tipo="number"
          valor={form.intento}
          onChange={v => setForm(f => ({ ...f, intento: v }))}
          ayuda="Número de veces que se ha cursado este ramo"
        />
        <Input
          etiqueta="Nota final (opcional)"
          tipo="number"
          valor={form.estado === 'ELIMINADO' ? '' : form.nota_final}
          onChange={v => setForm(f => ({ ...f, nota_final: v }))}
          placeholder={form.estado === 'ELIMINADO' ? 'No aplica para ramos eliminados' : 'Ej: 5.5'}
          ayuda={form.estado === 'ELIMINADO' ? undefined : 'Ingresa la nota final entre 1.0 y 7.0. Déjalo vacío si aún no tiene nota.'}
          inputProps={{ step: 0.1, min: 1, max: 7 }}
          deshabilitado={form.estado === 'ELIMINADO'}
        />
        <Input
          etiqueta="Comentario (opcional)"
          valor={form.comentario}
          onChange={v => setForm(f => ({ ...f, comentario: v }))}
          placeholder="Observaciones sobre el ramo"
        />
      </div>
    </Modal>
  );
}
