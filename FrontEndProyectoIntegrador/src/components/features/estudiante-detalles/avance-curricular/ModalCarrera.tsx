import { useState } from 'react';
import { Modal, Input, Select, Alert } from '../../../ui';
import type { UniversidadDto } from '../../../../services/universidad.service';
import type { Comuna } from '../../../../types';
import type { ViaAcceso } from '../../../../services/carrera-avance.service';
import { VIA_ACCESO_OPTS } from './constants';

export interface FormCarrera {
  nombre: string;
  codigo_universidad: number | null;
  universidad_nombre: string;
  // "Otra institución": la casa de estudios no está en el catálogo y se
  // registra al guardar la carrera, con su nombre y comuna.
  otra_institucion: boolean;
  nueva_institucion: string;
  nueva_comuna: number | null;
  duracion_sem: string;
  via_acceso: ViaAcceso;
  anio_ingreso: string;
}

interface ModalCarreraProps {
  abierto: boolean;
  onCerrar: () => void;
  form: FormCarrera;
  setForm: (fn: (f: FormCarrera) => FormCarrera) => void;
  universidades: UniversidadDto[];
  comunas: Comuna[];
  cargandoUniversidades: boolean;
  busquedaUniv: string;
  setBusquedaUniv: (v: string) => void;
  error: string;
  guardando: boolean;
  onGuardar: () => void;
}

export function ModalCarrera({
  abierto, onCerrar, form, setForm, universidades, comunas, cargandoUniversidades,
  busquedaUniv, setBusquedaUniv, error, guardando, onGuardar,
}: ModalCarreraProps) {
  const [busquedaComuna, setBusquedaComuna] = useState('');

  const univsFiltradas = universidades.filter(u =>
    u.nombre.toLowerCase().includes(busquedaUniv.toLowerCase()) ||
    u.comuna.nombre.toLowerCase().includes(busquedaUniv.toLowerCase())
  );

  const seleccionarUniversidad = (u: UniversidadDto) => {
    setForm(f => ({
      ...f, codigo_universidad: u.codigo_universidad, universidad_nombre: u.nombre,
      otra_institucion: false, nueva_institucion: '', nueva_comuna: null,
    }));
    setBusquedaUniv('');
  };

  const elegirOtra = () => {
    // Lo que se buscó sin éxito suele ser el nombre de la nueva institución.
    setForm(f => ({
      ...f, codigo_universidad: null, universidad_nombre: '',
      otra_institucion: true, nueva_institucion: busquedaUniv.trim(), nueva_comuna: null,
    }));
    setBusquedaUniv('');
    setBusquedaComuna('');
  };

  const volverAlCatalogo = () => {
    setForm(f => ({ ...f, otra_institucion: false, nueva_institucion: '', nueva_comuna: null }));
  };

  // Antes de crear una institución hay que descartar que ya exista con otro
  // nombre parecido ("Inacap" vs "INACAP"): se muestran las del catálogo cuyo
  // nombre contiene lo escrito, o viceversa, para elegirla en su lugar.
  const nuevaNorm = normalizar(form.nueva_institucion);
  const parecidas = form.otra_institucion && nuevaNorm.length >= 3
    ? universidades.filter(u => {
        const n = normalizar(u.nombre);
        return n.includes(nuevaNorm) || nuevaNorm.includes(n);
      }).slice(0, 5)
    : [];

  const comunaSeleccionada = comunas.find(c => c.codigo_comuna === form.nueva_comuna) ?? null;
  const comunasFiltradas = busquedaComuna && !comunaSeleccionada
    ? comunas.filter(c => normalizar(c.nombre).includes(normalizar(busquedaComuna))).slice(0, 8)
    : [];

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
          <p className="text-sm font-medium text-gray-700 mb-1.5">Institución de educación superior</p>
          {cargandoUniversidades ? (
            <p className="text-sm text-gray-400">Cargando instituciones…</p>
          ) : form.otra_institucion ? (
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <Input
                etiqueta="Nombre de la institución"
                valor={form.nueva_institucion}
                onChange={v => setForm(f => ({ ...f, nueva_institucion: v }))}
                placeholder="Ej: CFT Estatal de la Región de Coquimbo"
              />
              {parecidas.length > 0 && (
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <p className="font-semibold mb-1">Ya existen instituciones con un nombre parecido. ¿Es alguna de estas?</p>
                  {parecidas.map(u => (
                    <button
                      key={u.codigo_universidad}
                      type="button"
                      onClick={() => seleccionarUniversidad(u)}
                      className="block w-full text-left py-0.5 hover:underline"
                    >
                      {u.nombre} · {u.comuna.nombre}
                    </button>
                  ))}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1.5">Comuna</p>
                <input
                  type="text"
                  value={comunaSeleccionada ? comunaSeleccionada.nombre : busquedaComuna}
                  onChange={e => {
                    setBusquedaComuna(e.target.value);
                    if (comunaSeleccionada) setForm(f => ({ ...f, nueva_comuna: null }));
                  }}
                  placeholder="Buscar comuna…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#65B39B]/40 focus:border-[#65B39B]"
                />
                {busquedaComuna && !comunaSeleccionada && (
                  <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto shadow-sm bg-white">
                    {comunasFiltradas.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                    ) : (
                      comunasFiltradas.map(c => (
                        <button
                          key={c.codigo_comuna}
                          type="button"
                          onClick={() => {
                            setForm(f => ({ ...f, nueva_comuna: c.codigo_comuna }));
                            setBusquedaComuna('');
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[#65B39B]/10 transition-colors"
                        >
                          <span className="font-medium text-gray-800">{c.nombre}</span>
                          <span className="text-gray-400 ml-1 text-xs">· {c.region}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={volverAlCatalogo}
                className="text-xs text-[#65B39B] hover:underline"
              >
                ← Volver a buscar en el catálogo
              </button>
            </div>
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
                placeholder="Buscar institución por nombre o comuna…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#65B39B]/40 focus:border-[#65B39B]"
              />
              {busquedaUniv && !form.codigo_universidad && (
                <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto shadow-sm">
                  {univsFiltradas.length === 0 && (
                    <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                  )}
                  {univsFiltradas.slice(0, 8).map(u => (
                    <button
                      key={u.codigo_universidad}
                      type="button"
                      onClick={() => seleccionarUniversidad(u)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#65B39B]/10 transition-colors"
                    >
                      <span className="font-medium text-gray-800">{u.nombre}</span>
                      <span className="text-gray-400 ml-1 text-xs">· {u.comuna.nombre}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={elegirOtra}
                    className="w-full text-left px-3 py-2 text-sm font-semibold text-[#65B39B] border-t border-gray-100 hover:bg-[#65B39B]/10 transition-colors"
                  >
                    Otra institución (no está en la lista)
                  </button>
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
        <Input
          etiqueta="Año de ingreso"
          tipo="number"
          valor={form.anio_ingreso}
          onChange={v => setForm(f => ({ ...f, anio_ingreso: v }))}
          placeholder={`Si se deja vacío, se usa ${new Date().getFullYear()}`}
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

// Misma comparación que usa el backend para detectar duplicados: sin
// mayúsculas, tildes, signos ni espacios.
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}
