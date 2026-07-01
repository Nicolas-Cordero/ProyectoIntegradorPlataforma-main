import { Modal, Input, Select, Alert } from '../../../ui';
import type { UniversidadDto } from '../../../../services/universidad.service';
import type { ViaAcceso } from '../../../../services/carrera-avance.service';
import { VIA_ACCESO_OPTS } from './constants';

export interface FormCarrera {
  nombre: string;
  codigo_universidad: number | null;
  universidad_nombre: string;
  duracion_sem: string;
  via_acceso: ViaAcceso;
}

interface ModalCarreraProps {
  abierto: boolean;
  onCerrar: () => void;
  form: FormCarrera;
  setForm: (fn: (f: FormCarrera) => FormCarrera) => void;
  universidades: UniversidadDto[];
  cargandoUniversidades: boolean;
  busquedaUniv: string;
  setBusquedaUniv: (v: string) => void;
  error: string;
  guardando: boolean;
  onGuardar: () => void;
}

export function ModalCarrera({
  abierto, onCerrar, form, setForm, universidades, cargandoUniversidades,
  busquedaUniv, setBusquedaUniv, error, guardando, onGuardar,
}: ModalCarreraProps) {
  const univsFiltradas = universidades.filter(u =>
    u.nombre.toLowerCase().includes(busquedaUniv.toLowerCase()) ||
    u.comuna.toLowerCase().includes(busquedaUniv.toLowerCase())
  );

  return (
    <Modal
      titulo="Nueva carrera"
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
            {guardando ? 'Guardando…' : 'Agregar'}
          </button>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {error && <Alert tipo="error" mensaje={error} />}

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1.5">Universidad</p>
          {cargandoUniversidades ? (
            <p className="text-sm text-gray-400">Cargando universidades…</p>
          ) : (
            <>
              <input
                type="text"
                value={form.codigo_universidad ? form.universidad_nombre : busquedaUniv}
                onChange={e => {
                  setBusquedaUniv(e.target.value);
                  if (form.codigo_universidad) {
                    setForm(f => ({ ...f, codigo_universidad: null, universidad_nombre: '' }));
                  }
                }}
                placeholder="Buscar universidad por nombre o comuna…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#65B39B]/40 focus:border-[#65B39B]"
              />
              {busquedaUniv && !form.codigo_universidad && (
                <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto shadow-sm">
                  {univsFiltradas.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                  ) : (
                    univsFiltradas.slice(0, 8).map(u => (
                      <button
                        key={u.codigo_universidad}
                        type="button"
                        onClick={() => {
                          setForm(f => ({ ...f, codigo_universidad: u.codigo_universidad, universidad_nombre: u.nombre }));
                          setBusquedaUniv('');
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-[#65B39B]/10 transition-colors"
                      >
                        <span className="font-medium text-gray-800">{u.nombre}</span>
                        <span className="text-gray-400 ml-1 text-xs">· {u.comuna}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
              {form.codigo_universidad && (
                <p className="mt-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                  ✓ {form.universidad_nombre}
                </p>
              )}
            </>
          )}
        </div>

        <Input
          etiqueta="Nombre de la carrera"
          valor={form.nombre}
          onChange={v => setForm(f => ({ ...f, nombre: v }))}
          placeholder="Ej: Ingeniería Civil en Informática"
        />
        <Input
          etiqueta="Duración (semestres)"
          tipo="number"
          valor={form.duracion_sem}
          onChange={v => setForm(f => ({ ...f, duracion_sem: v }))}
          placeholder="Ej: 10"
        />
        <Select
          etiqueta="Vía de acceso"
          valor={form.via_acceso}
          onChange={v => setForm(f => ({ ...f, via_acceso: v as ViaAcceso }))}
          opciones={VIA_ACCESO_OPTS.map(o => ({ valor: o.valor, etiqueta: o.etiqueta }))}
        />
      </div>
    </Modal>
  );
}
