import { useEffect, useState } from 'react';
import { Modal, Input, Select, Textarea, Alert } from '../../../ui';
import type { EstadoRamoAvance } from '../../../../services/ramo-avance.service';
import { ESTADO_RAMO_OPTS } from './constants';

type Vista = 'edicion' | 'anotaciones';

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
  const [vista, setVista] = useState<Vista>('edicion');

  // Cada apertura del modal parte en "Edición", aunque la anterior se haya
  // cerrado desde "Anotaciones".
  useEffect(() => {
    if (abierto) setVista('edicion');
  }, [abierto]);

  const tieneAnotaciones = form.comentario.trim() !== '';

  return (
    <Modal
      titulo={esEdicion ? 'Editar ramo' : 'Nuevo ramo'}
      abierto={abierto}
      onCerrar={onCerrar}
      tamanio="lg"
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
      <div className="space-y-5">
        {/* Fuera de las pestañas: los errores de validación apuntan a campos de
            "Edición" y deben verse aunque se esté escribiendo una anotación. */}
        {error && <Alert tipo="error" mensaje={error} />}

        {/* Navegación edición / anotaciones */}
        <div className="flex justify-center gap-1 border-b border-gray-100 -mt-2">
          {(['edicion', 'anotaciones'] as const).map(v => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className={`px-4 py-2 text-sm transition-colors border-b-2 ${
                vista === v
                  ? 'text-[#65B39B] font-bold border-[#65B39B]'
                  : 'text-gray-500 font-medium border-transparent hover:text-[#65B39B]'
              }`}
            >
              {v === 'edicion' ? 'Edición' : 'Anotaciones'}
              {v === 'anotaciones' && tieneAnotaciones && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[#65B39B] align-middle" />
              )}
            </button>
          ))}
        </div>

        {/* min-h para que el modal no cambie de alto al saltar entre pestañas */}
        <div className="min-h-[260px] pt-1">
          {vista === 'edicion' ? (
            <div className="grid grid-cols-3 gap-x-4 gap-y-5 items-start">
              <div className="col-span-3">
                <Input
                  etiqueta="Nombre del ramo"
                  valor={form.nombre}
                  onChange={v => setForm(f => ({ ...f, nombre: v }))}
                  placeholder="Ej: Cálculo I"
                />
              </div>

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
                ayuda="Veces que se ha cursado el ramo (máximo 20)"
                inputProps={{ min: 1, max: 20 }}
              />
              <Input
                etiqueta="Nota final (opcional)"
                tipo="number"
                valor={form.estado === 'ELIMINADO' ? '' : form.nota_final}
                onChange={v => setForm(f => ({ ...f, nota_final: v }))}
                placeholder={form.estado === 'ELIMINADO' ? 'No aplica' : 'Ej: 5.5'}
                ayuda={form.estado === 'ELIMINADO'
                  ? 'No aplica para ramos eliminados'
                  : 'Entre 1.0 y 7.0. Déjalo vacío si aún no tiene nota.'}
                inputProps={{ step: 0.1, min: 1, max: 7 }}
                deshabilitado={form.estado === 'ELIMINADO'}
              />

              {form.estado === 'PENDIENTE' && (
                <div className="col-span-3">
                  <Alert
                    tipo="info"
                    mensaje="En pendiente podrás asignar una nota luego de cerrado el semestre."
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Observaciones sobre el ramo: contexto, acuerdos con el estudiante o cualquier
                antecedente que convenga dejar registrado.
              </p>
              <Textarea
                valor={form.comentario}
                onChange={v => setForm(f => ({ ...f, comentario: v }))}
                placeholder="Escribe aquí las anotaciones del ramo…"
                filas={9}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
