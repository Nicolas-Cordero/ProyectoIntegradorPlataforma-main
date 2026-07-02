import { useState } from 'react';
import { Modal, Alert } from '../../../ui';
import type { Beneficio, BeneficioEstudiante } from '../../../../types';
import { beneficiosService } from '../../../../services';

type EstadoBeneficio = BeneficioEstudiante['estado'];

const ESTADO_OPTS: { valor: EstadoBeneficio; etiqueta: string }[] = [
  { valor: 'ACTIVO',     etiqueta: 'Activo'      },
  { valor: 'EN_TRAMITE', etiqueta: 'En trámite'  },
  { valor: 'SUSPENDIDO', etiqueta: 'Suspendido'  },
  { valor: 'RECHAZADO',  etiqueta: 'Rechazado'   },
  { valor: 'FINALIZADO', etiqueta: 'Finalizado'  },
];

const TIPO_LABEL: Record<string, string> = {
  ARANCEL:     'Arancel',
  MANUTENCION: 'Manutención',
};

interface ModalAsignarBeneficioProps {
  abierto: boolean;
  onCerrar: () => void;
  rutEstudiante: string;
  catalogo: Beneficio[];
  yaAsignados: number[];
  onAsignado: (nueva: BeneficioEstudiante) => void;
}

export function ModalAsignarBeneficio({
  abierto, onCerrar, rutEstudiante, catalogo, yaAsignados, onAsignado,
}: ModalAsignarBeneficioProps) {
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState<Beneficio | null>(null);
  const [estado, setEstado] = useState<EstadoBeneficio>('ACTIVO');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const disponibles = catalogo.filter(b =>
    !yaAsignados.includes(b.codigo_beneficio) &&
    (
      b.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      b.proveedor.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  const reset = () => {
    setBusqueda('');
    setSeleccionado(null);
    setEstado('ACTIVO');
    setInicio('');
    setFin('');
    setError('');
  };

  const handleCerrar = () => { reset(); onCerrar(); };

  const handleGuardar = async () => {
    if (!seleccionado) { setError('Selecciona un beneficio del catálogo'); return; }
    if (!inicio)       { setError('La fecha de inicio es obligatoria'); return; }
    if (fin && fin < inicio) { setError('La fecha de fin no puede ser anterior a la fecha de inicio'); return; }

    setGuardando(true);
    setError('');
    try {
      const nueva = await beneficiosService.asignarBeneficioEstudiante({
        codigo_beneficio: seleccionado.codigo_beneficio,
        rut_estudiante:   rutEstudiante,
        estado,
        inicio,
        fin: fin || inicio,
      });
      onAsignado(nueva);
      handleCerrar();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al asignar el beneficio');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      titulo="Asignar beneficio"
      abierto={abierto}
      onCerrar={handleCerrar}
      tamanio="sm"
      acciones={
        <div className="flex gap-2 justify-end w-full">
          <button
            onClick={handleCerrar}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="px-4 py-2 text-sm rounded-lg bg-[#65B39B] text-white font-semibold hover:bg-[#4a9e87] disabled:opacity-50 transition-colors"
          >
            {guardando ? 'Guardando…' : 'Asignar'}
          </button>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {error && <Alert tipo="error" mensaje={error} />}

        {/* Selección de beneficio */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1.5">Beneficio</p>
          {seleccionado ? (
            <div className="flex items-center justify-between gap-2 p-3 bg-[#65B39B]/10 border border-[#65B39B]/40 rounded-lg">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{seleccionado.nombre}</p>
                <p className="text-xs text-gray-500">
                  {seleccionado.proveedor} · {TIPO_LABEL[seleccionado.tipo] ?? seleccionado.tipo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setSeleccionado(null); setBusqueda(''); }}
                className="shrink-0 text-xs text-[#65B39B] hover:text-[#3a7a6b] underline"
              >
                Cambiar
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o proveedor…"
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#65B39B]/40 focus:border-[#65B39B]"
              />
              <div className="mt-1 border border-gray-200 rounded-lg max-h-44 overflow-y-auto shadow-sm">
                {catalogo.length === 0 ? (
                  <p className="px-3 py-2.5 text-sm text-gray-400">Cargando catálogo…</p>
                ) : disponibles.length === 0 ? (
                  <p className="px-3 py-2.5 text-sm text-gray-400">
                    {yaAsignados.length >= catalogo.length
                      ? 'El estudiante ya tiene todos los beneficios disponibles'
                      : 'Sin resultados'}
                  </p>
                ) : (
                  disponibles.map(b => (
                    <button
                      key={b.codigo_beneficio}
                      type="button"
                      onClick={() => setSeleccionado(b)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-[#65B39B]/10 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <p className="font-medium text-gray-800">{b.nombre}</p>
                      <p className="text-xs text-gray-400">
                        {b.proveedor} · {TIPO_LABEL[b.tipo] ?? b.tipo}
                        {b.monto > 0 && ` · ${b.monto.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })}`}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Estado */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1.5">Estado</p>
          <select
            value={estado}
            onChange={e => setEstado(e.target.value as EstadoBeneficio)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#65B39B]/40 focus:border-[#65B39B]"
          >
            {ESTADO_OPTS.map(o => (
              <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
            ))}
          </select>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">Fecha inicio</p>
            <input
              type="date"
              value={inicio}
              onChange={e => setInicio(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#65B39B]/40 focus:border-[#65B39B]"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">
              Fecha fin <span className="text-gray-400 font-normal text-xs">(opcional)</span>
            </p>
            <input
              type="date"
              value={fin}
              min={inicio}
              onChange={e => setFin(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#65B39B]/40 focus:border-[#65B39B]"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
