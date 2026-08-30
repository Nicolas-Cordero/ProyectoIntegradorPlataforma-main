import { useState } from 'react';
import { Select } from '../../../ui';
import { historialEstadoCarreraService } from '../../../../services';
import type { EstadoEstudiante } from '../../../../types';
import type { CarreraUI } from './types';
import { ESTADO_CARRERA_CHIP, ESTADO_CARRERA_OPTS } from './constants';
import { formatDate } from '../../../../utils/dateUtils';

interface HistorialEstadoSeccionProps {
  carrera: CarreraUI;
  canEdit: boolean;
  onEstadoCambiado: (nuevoEstado: EstadoEstudiante) => void;
}

export function HistorialEstadoSeccion({ carrera, canEdit, onEstadoCambiado }: HistorialEstadoSeccionProps) {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoEstudiante>(carrera.estado);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const chip = ESTADO_CARRERA_CHIP[carrera.estado];

  const handleCambiarEstado = async () => {
    if (estadoSeleccionado === carrera.estado) return;
    setGuardando(true);
    setError('');
    try {
      await historialEstadoCarreraService.cambiarEstado({
        codigo_carrera: carrera.codigo_carrera,
        estado_nuevo: estadoSeleccionado,
      });
      onEstadoCambiado(estadoSeleccionado);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cambiar el estado.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-100 pt-5">
      <p className="text-sm font-bold text-gray-700 mb-3">Estado de la carrera</p>

      {/* Estado actual + selector */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">Estado actual</p>
          <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${chip.bg} ${chip.text}`}>
            {chip.label}
          </span>
        </div>

        {canEdit && (
          <>
            <div className="w-44">
              <Select
                etiqueta="Cambiar a"
                valor={estadoSeleccionado}
                onChange={v => setEstadoSeleccionado(v as EstadoEstudiante)}
                opciones={ESTADO_CARRERA_OPTS}
                tamano="small"
              />
            </div>
            <button
              onClick={handleCambiarEstado}
              disabled={guardando || estadoSeleccionado === carrera.estado}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#65B39B] text-white hover:bg-[#4a9e87] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {guardando ? 'Guardando…' : 'Confirmar'}
            </button>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {/* Tabla de historial */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Historial de estados</p>
      {carrera.historialCargando ? (
        <p className="text-sm text-gray-400 py-2">Cargando historial…</p>
      ) : carrera.historial.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">Sin registros de historial.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100">
                <th className="py-2 px-4 text-left">Estado anterior</th>
                <th className="py-2 px-4 text-left">Estado nuevo</th>
                <th className="py-2 px-4 text-left">Modificado por</th>
                <th className="py-2 px-4 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {/* El backend devuelve el historial en orden cronológico ascendente
                  (lo necesita el cálculo de semestres suspendidos); se invierte
                  aquí solo para mostrar los cambios más recientes primero. */}
              {[...carrera.historial].reverse().map(h => {
                const chipNuevo = ESTADO_CARRERA_CHIP[h.estado_nuevo];
                return (
                  <tr key={h.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-2.5 px-4 text-gray-400">
                      {h.estado_anterior
                        ? <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${ESTADO_CARRERA_CHIP[h.estado_anterior].bg} ${ESTADO_CARRERA_CHIP[h.estado_anterior].text}`}>
                            {ESTADO_CARRERA_CHIP[h.estado_anterior].label}
                          </span>
                        : <span className="text-gray-300 text-xs">—</span>
                      }
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${chipNuevo.bg} ${chipNuevo.text}`}>
                        {chipNuevo.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-600">
                      {h.usuario.nombre} {h.usuario.apellido}
                    </td>
                    <td className="py-2.5 px-4 text-gray-400 whitespace-nowrap">
                      {formatDate(h.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
