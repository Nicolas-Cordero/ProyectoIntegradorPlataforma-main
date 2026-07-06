import { useState, useEffect, useRef } from 'react';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { Alert } from '../../../ui';
import { Spinner } from '../../../ui';
import type { EstadoEstudiante } from '../../../../types';
import type { CarreraUI, RamoUI } from './types';
import { semLabel } from './constants';
import { SemestreColumna } from './SemestreColumna';
import { HistorialEstadoSeccion } from './HistorialEstadoSeccion';

interface CarreraAcordeonProps {
  carrera: CarreraUI;
  canEdit: boolean;
  canAdmin: boolean;
  onEliminarCarrera: () => void;
  onAgregarSemestre: () => void;
  onCerrarSemestre: (semId: number) => void;
  onEliminarSemestre: (semId: number) => void;
  onAgregarRamo: (semId: number) => void;
  onEditarRamo: (semId: number, ramo: RamoUI) => void;
  onEliminarRamo: (semId: number, ramo: RamoUI) => void;
  onEstadoCambiado: (nuevoEstado: EstadoEstudiante) => void;
}

export function CarreraAcordeon({
  carrera, canEdit, canAdmin, onEliminarCarrera, onAgregarSemestre,
  onCerrarSemestre, onEliminarSemestre, onAgregarRamo, onEditarRamo, onEliminarRamo,
  onEstadoCambiado,
}: CarreraAcordeonProps) {
  const [expandido, setExpandido] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expandido || carrera.cargando || carrera.semestres.length === 0) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
    });
  }, [expandido, carrera.cargando, carrera.semestres.length]);

  const ultimoSem = carrera.semestres.at(-1) ?? null;
  const carreraActiva = carrera.estado === 'ACTIVO';
  const puedeAgregarSem = !carrera.cargando && carreraActiva && (!ultimoSem || ultimoSem.cerrado);

  const tooltipAgregarSem =
    carrera.cargando
      ? 'Espera mientras se cargan los datos'
      : !carreraActiva
        ? 'La carrera debe estar Activa para agregar semestres'
        : !puedeAgregarSem
          ? 'Cierra el semestre actual antes de agregar uno nuevo'
          : undefined;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Cabecera */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer select-none hover:bg-gray-50 transition-colors"
        onClick={() => setExpandido(e => !e)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {expandido
            ? <ExpandLessIcon sx={{ fontSize: 20, color: '#9ca3af', flexShrink: 0 }} />
            : <ExpandMoreIcon sx={{ fontSize: 20, color: '#9ca3af', flexShrink: 0 }} />}
          <SchoolIcon sx={{ color: '#65B39B', fontSize: 22, flexShrink: 0 }} />
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-800 truncate">{carrera.nombre}</p>
            <p className="text-base text-gray-400 truncate">
              {carrera.via_acceso} · {carrera.duracion_sem} semestres
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4" onClick={e => e.stopPropagation()}>
          {canEdit && (
            <button
              onClick={onAgregarSemestre}
              disabled={!puedeAgregarSem}
              title={tooltipAgregarSem}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-[#65B39B] text-white hover:bg-[#4a9e87] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <AddIcon sx={{ fontSize: 16 }} />
              {carrera.cargando ? 'Cargando…' : 'Nuevo semestre'}
            </button>
          )}
          {canAdmin && (
            <button
              onClick={onEliminarCarrera}
              title="Eliminar carrera"
              className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </button>
          )}
        </div>
      </div>

      {/* Contenido expandido */}
      {expandido && (
        <div className="border-t border-gray-100 px-6 py-5">
          {carrera.cargando && (
            <div className="flex justify-center py-8">
              <Spinner message="Cargando semestres…" />
            </div>
          )}

          {carrera.error && <Alert tipo="error" mensaje={carrera.error} />}

          {/* ── Administración de semestres (primero) ── */}
          {!carrera.cargando && !carrera.error && (
            <>
              {!carreraActiva && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 mb-5">
                  <span>🔒</span>
                  <span>
                    La carrera está en estado <strong>{carrera.estado}</strong>. No se pueden agregar nuevos semestres hasta que esté <strong>Activa</strong>.
                  </span>
                </div>
              )}
              {!puedeAgregarSem && carreraActiva && ultimoSem && (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                  <span>⚠️</span>
                  <span>
                    Cierra <strong>{semLabel(ultimoSem.year, ultimoSem.tipo, ultimoSem.codigo)}</strong> antes de agregar el siguiente semestre.
                  </span>
                </div>
              )}

              {carrera.semestres.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
                  <p className="text-base text-gray-400 mb-4">Esta carrera no tiene semestres registrados aún.</p>
                  {canEdit && (
                    <button
                      onClick={onAgregarSemestre}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#65B39B] border border-[#65B39B]/40 rounded-lg hover:bg-[#65B39B]/5 transition-colors"
                    >
                      <AddIcon sx={{ fontSize: 16 }} />
                      Agregar primer semestre
                    </button>
                  )}
                </div>
              ) : (
                <div ref={scrollRef} className="overflow-x-auto pb-2">
                  <div className="flex gap-5" style={{ minWidth: 'max-content' }}>
                    {carrera.semestres.map(sem => (
                      <SemestreColumna
                        key={sem.semestre_id}
                        semestre={sem}
                        canEdit={canEdit}
                        canAdmin={canAdmin}
                        onCerrar={() => onCerrarSemestre(sem.semestre_id)}
                        onEliminar={() => onEliminarSemestre(sem.semestre_id)}
                        onAgregarRamo={() => onAgregarRamo(sem.semestre_id)}
                        onEditarRamo={ramo => onEditarRamo(sem.semestre_id, ramo)}
                        onEliminarRamo={ramo => onEliminarRamo(sem.semestre_id, ramo)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Historial de estado (debajo de los semestres) ── */}
          <HistorialEstadoSeccion
            carrera={carrera}
            canEdit={canEdit}
            onEstadoCambiado={onEstadoCambiado}
          />
        </div>
      )}
    </div>
  );
}
