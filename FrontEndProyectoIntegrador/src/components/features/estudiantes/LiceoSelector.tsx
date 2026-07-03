import { useEffect, useState } from 'react';
import { liceoService } from '../../../services';
import type { Liceo } from '../../../types';

const INPUT_CLASS =
  'w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B] bg-white transition-colors';

const LABEL_CLASS = 'block text-xs font-semibold text-gray-600 mb-1';

interface LiceoSelectorProps {
  /** RBD actualmente seleccionado */
  value: string;
  onChange: (rbd: string) => void;
  disabled?: boolean;
  etiqueta?: string;
  /** Liceo ya conocido por el padre, para mostrar el nombre sin esperar el fetch (ej. al editar un estudiante) */
  liceoInicial?: Liceo | null;
}

/** Input con búsqueda y dropdown para seleccionar un liceo precargado en la base de datos por nombre o RBD. */
export function LiceoSelector({ value, onChange, disabled, etiqueta = 'Liceo *', liceoInicial }: LiceoSelectorProps) {
  const [liceos, setLiceos] = useState<Liceo[]>([]);
  const [search, setSearch] = useState(liceoInicial ? `${liceoInicial.nombre} (${liceoInicial.rbd})` : '');

  useEffect(() => {
    liceoService.getAll().then(setLiceos).catch(() => {});
  }, []);

  const opciones = search && !value
    ? liceos
        .filter((l) => {
          const lower = search.toLowerCase();
          return (
            l.nombre.toLowerCase().includes(lower) ||
            l.rbd.toLowerCase().includes(lower) ||
            (l.comuna ?? '').toLowerCase().includes(lower)
          );
        })
        .slice(0, 8)
    : [];

  return (
    <div>
      <label className={LABEL_CLASS}>{etiqueta}</label>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          // Si el usuario escribe algo distinto al liceo seleccionado, limpiar la selección
          const seleccionado = liceos.find((l) => l.rbd === value);
          if (seleccionado && e.target.value !== `${seleccionado.nombre} (${seleccionado.rbd})`) {
            onChange('');
          }
        }}
        placeholder="Buscar liceo por nombre o RBD..."
        disabled={disabled}
        className={INPUT_CLASS}
      />
      {opciones.length > 0 && (
        <div className="border border-gray-200 rounded-lg mt-1 bg-white shadow-lg z-10 max-h-48 overflow-y-auto">
          {opciones.map((l) => (
            <button
              key={l.rbd}
              type="button"
              onClick={() => {
                onChange(l.rbd);
                setSearch(`${l.nombre} (${l.rbd})`);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-[#65B39B]/10 transition-colors border-b border-gray-100 last:border-0"
            >
              <span className="font-medium text-gray-800">{l.nombre}</span>
              <span className="text-gray-400 text-xs ml-2">RBD: {l.rbd}</span>
              {l.comuna && <span className="text-gray-400 text-xs ml-1">— {l.comuna}</span>}
            </button>
          ))}
        </div>
      )}
      {value && (
        <p className="text-xs text-[#65B39B] mt-1 font-medium">✓ RBD seleccionado: {value}</p>
      )}
    </div>
  );
}
