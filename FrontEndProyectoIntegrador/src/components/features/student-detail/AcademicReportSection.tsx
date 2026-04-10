/**
 * Sección de informe académico general
 * Resumen académico y detalle por año y semestre
 */
import React, { useEffect, useMemo, useState } from 'react';
import type { Estudiante, HistorialAcademico } from '../../../types';
import { historialAcademicoService, authService } from '../../../services';
import {
  getEstudianteSemestresSuspendidos,
  getEstudianteSemestresCarrera,
  getHistorialAño,
  getHistorialSemestre
} from '../../../utils/migration-helpers';

interface AcademicReportSectionProps {
  estudiante: Estudiante;
  modoEdicion: boolean;
  historialesExternos?: HistorialAcademico[];
}



export const AcademicReportSection: React.FC<AcademicReportSectionProps> = ({ estudiante, modoEdicion, historialesExternos }) => {
  const usuario = authService.getCurrentUser();
  const autor = useMemo(
    () => usuario?.email || (usuario as any)?.nombres || (usuario as any)?.apellidos || (usuario as any)?.id || 'usuario',
    [usuario]
  );

  const [filas, setFilas] = useState<Array<{
    id?: string | number;
    año: number | null;
    semestre: number | null;
    nSemestreCarrera: number;
    ramosAprobados: number;
    ramosReprobados: number;
    ramosEliminados: number;
    totalRamos: number;
    observaciones: string;
    promedioSemestre: number | null;
    nivelEducativo?: string;
    ultimaActualizacionPor?: string;
  }>>([]);

  const [accionFila, setAccionFila] = useState<{ index: number; tipo: 'guardar' | 'eliminar' } | null>(null);
  const [mensajeGlobal, setMensajeGlobal] = useState<string>('');
  const [errorGlobal, setErrorGlobal] = useState<string>('');

  // Helper functions para calcular estadísticas académicas
  const historialAcademico: HistorialAcademico[] = (historialesExternos && historialesExternos.length > 0)
    ? historialesExternos
    : (estudiante.historialesAcademicos || []);
  const ramosCursados = estudiante.ramosCursados || [];
  
  // Calcular totales de ramos
  const calcularTotalRamos = () => {
    const aprobados = ramosCursados.filter(r => r.estado === 'aprobado' || r.estado === 'A').length;
    const reprobados = ramosCursados.filter(r => r.estado === 'reprobado' || r.estado === 'R').length;
    const eliminados = ramosCursados.filter(r => r.estado === 'eliminado' || r.estado === 'E').length;
    const total = aprobados + reprobados + eliminados;
    
    return { aprobados, reprobados, eliminados, total };
  };

  // Estado para resumen editable (manual)
  const construirResumenBase = () => {
    const resumenApi = (estudiante.informacionAcademica as any)?.resumen_semestres;
    if (resumenApi) return { ...resumenApi } as Record<string, any>;

    // fallback: calcular por defecto desde ramos/historial, pero luego el usuario puede sobrescribir
    const { aprobados, reprobados, eliminados } = calcularTotalRamos();
    const total = aprobados + reprobados + eliminados;
    const porcAprobados = total === 0 ? 0 : Number(((aprobados / total) * 100).toFixed(1));
    const porcReprobados = total === 0 ? 0 : Number(((reprobados / total) * 100).toFixed(1));
    return {
      numeroCarrera: estudiante.numero_carrera || 1,
      semestresFinalizados: historialAcademico.length,
      semestresSuspendidos: getEstudianteSemestresSuspendidos(estudiante) || 0,
      semestresCarrera: getEstudianteSemestresCarrera(estudiante) || 10,
      totalAprobados: aprobados,
      totalReprobados: reprobados,
      totalEliminados: eliminados,
      porcAprobados,
      porcReprobados,
      porcTotal: 100,
    } as Record<string, any>;
  };

  const [resumenManual, setResumenManual] = useState<Record<string, any>>(construirResumenBase());

  const adaptarHistoriales = (items: HistorialAcademico[]) => {
    const registros = items
      .filter((historial: HistorialAcademico) => getHistorialAño(historial) || getHistorialSemestre(historial))
      .map((historial: HistorialAcademico) => {
        const obs = typeof historial.observaciones === 'string'
          ? historial.observaciones
          : String(historial.observaciones ?? '');

        return {
          id: (historial as any)?.id_historial_academico,
          año: getHistorialAño(historial) ?? null,
          semestre: getHistorialSemestre(historial) ?? null,
          nSemestreCarrera: 0,
          ramosAprobados: historial.ramos_aprobados ?? 0,
          ramosReprobados: historial.ramos_reprobados ?? 0,
          ramosEliminados: historial.ramos_eliminados ?? 0,
          totalRamos: (historial.ramos_aprobados ?? 0) + (historial.ramos_reprobados ?? 0) + (historial.ramos_eliminados ?? 0),
          observaciones: obs || historial.trayectoria_academica?.join(', ') || '',
          promedioSemestre: historial.promedio_semestre ?? null,
          nivelEducativo: historial.nivel_educativo,
          ultimaActualizacionPor: historial.ultima_actualizacion_por || '',
        } as typeof filas[number];
      });

    return normalizarFilas(registros, { ordenar: true });
  };

  const calcularResumenDesdeFilas = (items: typeof filas) => {
    const aprobados = items.reduce((acc, f) => acc + (f.ramosAprobados || 0), 0);
    const reprobados = items.reduce((acc, f) => acc + (f.ramosReprobados || 0), 0);
    const eliminados = items.reduce((acc, f) => acc + (f.ramosEliminados || 0), 0);
    const total = aprobados + reprobados + eliminados;
    const porcAprobados = total === 0 ? 0 : Number(((aprobados / total) * 100).toFixed(1));
    const porcReprobados = total === 0 ? 0 : Number(((reprobados / total) * 100).toFixed(1));

    return {
      numeroCarrera: estudiante.numero_carrera || 1,
      semestresFinalizados: items.filter(f => f.año !== null && f.semestre !== null).length,
      semestresSuspendidos: getEstudianteSemestresSuspendidos(estudiante) || 0,
      semestresCarrera: getEstudianteSemestresCarrera(estudiante) || items.length || 0,
      totalAprobados: aprobados,
      totalReprobados: reprobados,
      totalEliminados: eliminados,
      porcAprobados,
      porcReprobados,
      porcTotal: 100,
    } as Record<string, any>;
  };
  
  // Calcular semestres finalizados
  
  // Helper para ordenar y numerar semestres de carrera
  const ordenarFilas = (items: typeof filas) => {
    // Solo ordena para la carga inicial sin recalcular la numeración manual
    return [...items].sort((a, b) => {
      if (a.año === null || a.semestre === null) return 1;
      if (b.año === null || b.semestre === null) return -1;
      if ((a.año ?? 0) !== (b.año ?? 0)) return (a.año ?? 0) - (b.año ?? 0);
      return (a.semestre ?? 0) - (b.semestre ?? 0);
    });
  };

  const calcularTotalFila = (fila: typeof filas[number]) =>
    (fila.ramosAprobados || 0) + (fila.ramosReprobados || 0) + (fila.ramosEliminados || 0);

  const normalizarFilas = (items: typeof filas, opts: { ordenar?: boolean } = {}) => {
    const base = opts.ordenar ? ordenarFilas(items) : [...items];

    const recalculadas = base.map(fila => ({
      ...fila,
      totalRamos: calcularTotalFila(fila),
    }));

    return recalculadas.map((fila, idx) => ({
      ...fila,
      nSemestreCarrera: idx + 1,
    }));
  };

  const cargarFilasDesdeApi = async (estudianteId?: string) => {
    if (!estudianteId) return;
    try {
      const recarga = await historialAcademicoService.getByEstudiante(estudianteId);
      const filasActualizadas = adaptarHistoriales(Array.isArray(recarga) ? recarga : []);
      setFilas(filasActualizadas);
    } catch (err: any) {
      setErrorGlobal(err?.message || 'No se pudo cargar el detalle académico');
    }
  };

  useEffect(() => {
    // Cargar siempre desde API para mostrar lo último guardado
    cargarFilasDesdeApi(String(estudiante.id_estudiante || ''));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estudiante?.id_estudiante]);

  useEffect(() => {
    // Evitar parpadeo: solo recalcular resumen cuando hay filas cargadas
    if (filas.length > 0) {
      setResumenManual(calcularResumenDesdeFilas(filas));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filas]);

  const handleChangeFila = (index: number, campo: string, valor: string) => {
    setFilas(prev => {
      const numeroCampos = ['año', 'semestre', 'nSemestreCarrera', 'ramosAprobados', 'ramosReprobados', 'ramosEliminados', 'promedioSemestre'];
      const actualizadas = prev.map((fila, i) => {
        if (i !== index) return fila;

        const nuevoValor = numeroCampos.includes(campo)
          ? (valor === '' ? null : Number(valor))
          : valor;

        return {
          ...fila,
          [campo]: nuevoValor,
        };
      });

      return normalizarFilas(actualizadas);
    });
  };

  const handleAgregarFila = () => {
    const añoActual = new Date().getFullYear();
    const semestreActual = new Date().getMonth() < 6 ? 1 : 2;
    setFilas(prev => normalizarFilas([
      ...prev,
      {
        año: añoActual,
        semestre: semestreActual,
        nSemestreCarrera: prev.length + 1,
        ramosAprobados: 0,
        ramosReprobados: 0,
        ramosEliminados: 0,
        totalRamos: 0,
        observaciones: '',
        promedioSemestre: null,
        nivelEducativo: estudiante.institucion?.nivel_educativo,
        ultimaActualizacionPor: '',
      }
    ]));
  };

  const handleGuardarFila = async (index: number) => {
    const fila = filas[index];
    if (!estudiante.id_estudiante) return;
    if (fila.año === null || fila.semestre === null) {
      setErrorGlobal('Completa año y semestre antes de guardar.');
      return;
    }
    setAccionFila({ index, tipo: 'guardar' });
    setMensajeGlobal('');
    setErrorGlobal('');

    try {
      const normalizeNumber = (value: number | null | undefined) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : undefined;
      };

      const normalizeText = (value: string | null | undefined) => {
        if (typeof value !== 'string') return '';
        return value.trim();
      };

      const payloadBase = {
        año: normalizeNumber(fila.año),
        semestre: normalizeNumber(fila.semestre),
        nivel_educativo: fila.nivelEducativo || estudiante.institucion?.nivel_educativo || 'Superior',
        ramos_aprobados: normalizeNumber(fila.ramosAprobados) ?? 0,
        ramos_reprobados: normalizeNumber(fila.ramosReprobados) ?? 0,
        ramos_eliminados: normalizeNumber(fila.ramosEliminados) ?? 0,
        promedio_semestre: normalizeNumber(fila.promedioSemestre) ?? 0,
        observaciones: normalizeText(fila.observaciones),
        ultima_actualizacion_por: autor,
      };

      // El backend rechaza null/undefined y valores no numéricos; limpiamos
      const sanitized = Object.fromEntries(
        Object.entries(payloadBase).filter(([, value]) => value !== null && value !== undefined),
      );

      if (fila.id) {
        const targetId = Number(fila.id);
        await historialAcademicoService.update(Number.isFinite(targetId) ? targetId : (fila.id as any), sanitized);
      } else {
        await historialAcademicoService.create({
          id_estudiante: String(estudiante.id_estudiante),
          ...sanitized,
        });
      }

      // Refrescar filas desde backend para asegurar que observaciones y demás campos se reflejen
      await cargarFilasDesdeApi(String(estudiante.id_estudiante));

      setMensajeGlobal('Cambios guardados');
    } catch (err: any) {
      setErrorGlobal(err?.message || 'No se pudo guardar la fila');
    } finally {
      setAccionFila(null);
    }
  };

  const handleEliminarFila = async (index: number) => {
    const fila = filas[index];
    setAccionFila({ index, tipo: 'eliminar' });
    setMensajeGlobal('');
    setErrorGlobal('');

    try {
      if (fila?.id !== undefined && fila?.id !== null) {
        await historialAcademicoService.delete(String(fila.id));
      }

      setFilas(prev => normalizarFilas(prev.filter((_, i) => i !== index)));
      setMensajeGlobal('Fila eliminada');
    } catch (err: any) {
      setErrorGlobal(err?.message || 'No se pudo eliminar la fila');
    } finally {
      setAccionFila(null);
    }
  };
  
  useEffect(() => {
    // Rehidratar solo cuando cambia el estudiante (id) para evitar sobrescribir el resumen en cada render
    setResumenManual(construirResumenBase());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estudiante?.id_estudiante]);

  const handleChangeResumen = (campo: string, valor: string) => {
    setResumenManual(prev => ({
      ...prev,
      [campo]: valor === '' ? '' : isNaN(Number(valor)) ? valor : Number(valor),
    }));
  };

  const datosPorSemestre = filas;
  return (
    <div>
      <div className="bg-[var(--color-turquoise)] text-white text-center font-bold text-xl py-3 mb-2">
        Informe Académico General
      </div>
      <div className="bg-yellow-200 p-2 text-center font-semibold mb-4 border border-gray-300 text-sm">
        Resumen académico
      </div>

      <table 
        className="w-full border-collapse mb-8"
        role="table"
        aria-label="Resumen académico del estudiante"
      >
        <tbody>
          <tr>
            <td className="bg-rose-200 text-center align-middle font-bold text-sm p-2 border border-gray-300 w-32" rowSpan={10}>
              {estudiante.nombre || 'Sin nombre'}
            </td>
            <td className="font-bold p-2 bg-rose-200 w-[30%] border border-gray-300">Nº de carrera cursada</td>
            <td className="p-2 border border-gray-300 bg-white">
              {modoEdicion ? (
                <input
                  type="number"
                  value={resumenManual.numeroCarrera ?? ''}
                  onChange={(e) => handleChangeResumen('numeroCarrera', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              ) : resumenManual.numeroCarrera}
            </td>
          </tr>
          <tr>
            <td className="font-bold p-2 bg-rose-200 w-[30%] border border-gray-300">Nº semestres finalizados</td>
            <td className="p-2 border border-gray-300 bg-white">
              {modoEdicion ? (
                <input
                  type="number"
                  value={resumenManual.semestresFinalizados ?? ''}
                  onChange={(e) => handleChangeResumen('semestresFinalizados', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              ) : resumenManual.semestresFinalizados}
            </td>
          </tr>
          <tr>
            <td className="font-bold p-2 bg-rose-200 w-[30%] border border-gray-300">Nº semestres suspendidos</td>
            <td className="p-2 border border-gray-300 bg-white">
              {modoEdicion ? (
                <input
                  type="number"
                  value={resumenManual.semestresSuspendidos ?? ''}
                  onChange={(e) => handleChangeResumen('semestresSuspendidos', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              ) : resumenManual.semestresSuspendidos}
            </td>
          </tr>
          <tr>
            <td className="font-bold p-2 bg-rose-200 w-[30%] border border-gray-300">Nº semestres de carrera</td>
            <td className="p-2 border border-gray-300 bg-white">
              {modoEdicion ? (
                <input
                  type="number"
                  value={resumenManual.semestresCarrera ?? ''}
                  onChange={(e) => handleChangeResumen('semestresCarrera', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              ) : resumenManual.semestresCarrera}
            </td>
          </tr>
          <tr>
            <td className="font-bold p-2 bg-rose-200 w-[30%] border border-gray-300">Total ramos aprobados</td>
            <td className="p-2 border border-gray-300 bg-white">
              {modoEdicion ? (
                <input
                  type="number"
                  value={resumenManual.totalAprobados ?? ''}
                  onChange={(e) => handleChangeResumen('totalAprobados', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              ) : resumenManual.totalAprobados}
            </td>
          </tr>
          <tr>
            <td className="font-bold p-2 bg-rose-200 w-[30%] border border-gray-300">Total ramos reprobados</td>
            <td className="p-2 border border-gray-300 bg-white">
              {modoEdicion ? (
                <input
                  type="number"
                  value={resumenManual.totalReprobados ?? ''}
                  onChange={(e) => handleChangeResumen('totalReprobados', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              ) : resumenManual.totalReprobados}
            </td>
          </tr>
          <tr>
            <td className="font-bold p-2 bg-rose-200 w-[30%] border border-gray-300">Total eliminados</td>
            <td className="p-2 border border-gray-300 bg-white">
              {modoEdicion ? (
                <input
                  type="number"
                  value={resumenManual.totalEliminados ?? ''}
                  onChange={(e) => handleChangeResumen('totalEliminados', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              ) : resumenManual.totalEliminados}
            </td>
          </tr>
          <tr>
            <td className="font-bold p-2 bg-rose-200 w-[30%] border border-gray-300">% Ramos aprobados</td>
            <td className="p-2 border border-gray-300 bg-white">
              {modoEdicion ? (
                <input
                  type="number"
                  step="0.1"
                  value={resumenManual.porcAprobados ?? ''}
                  onChange={(e) => handleChangeResumen('porcAprobados', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              ) : `${resumenManual.porcAprobados ?? 0}%`}
            </td>
          </tr>
          <tr>
            <td className="font-bold p-2 bg-rose-200 w-[30%] border border-gray-300">% Reprobados</td>
            <td className="p-2 border border-gray-300 bg-white">
              {modoEdicion ? (
                <input
                  type="number"
                  step="0.1"
                  value={resumenManual.porcReprobados ?? ''}
                  onChange={(e) => handleChangeResumen('porcReprobados', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              ) : `${resumenManual.porcReprobados ?? 0}%`}
            </td>
          </tr>
          <tr>
            <td className="font-bold p-2 bg-rose-200 w-[30%] border border-gray-300">% Total cursados</td>
            <td className="p-2 border border-gray-300 bg-white">
              {modoEdicion ? (
                <input
                  type="number"
                  step="0.1"
                  value={resumenManual.porcTotal ?? ''}
                  onChange={(e) => handleChangeResumen('porcTotal', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              ) : `${resumenManual.porcTotal ?? 0}%`}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Botón de guardar resumen manual eliminado; el guardado general se encarga del resumen */}

      {modoEdicion && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleAgregarFila}
            className="px-3 py-2 bg-[var(--color-turquoise)] text-white font-bold rounded"
          >
            Agregar fila
          </button>
        </div>
      )}

      <h3 className="text-base font-semibold mb-3 text-gray-900">Detalle por año y semestre</h3>
      <table 
        className="w-full border-collapse"
        role="table"
        aria-label="Detalle académico por año y semestre"
      >
        <thead>
          <tr>
            <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300">Año</th>
            <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300">Semestre</th>
            <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300">Nº Semestre Carrera</th>
            <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300">Ramos Aprobados</th>
            <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300">Ramos Reprobados</th>
            <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300">Ramos Eliminados</th>
            <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300">Total Ramos</th>
            <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300">Observaciones</th>
            {modoEdicion && (
              <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {datosPorSemestre.length > 0 ? (
            datosPorSemestre.map((fila, idx) => (
              <tr key={idx}>
                <td className="p-2 text-center border">
                  {modoEdicion ? (
                    <input
                      type="number"
                      value={fila.año ?? ''}
                      onChange={(e) => handleChangeFila(idx, 'año', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  ) : (fila.año || '-')}
                </td>
                <td className="p-2 text-center border">
                  {modoEdicion ? (
                    <input
                      type="number"
                      value={fila.semestre ?? ''}
                      onChange={(e) => handleChangeFila(idx, 'semestre', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  ) : (fila.semestre || '-')}
                </td>
                <td className="p-2 text-center border">
                  {modoEdicion ? (
                    <input
                      type="number"
                      value={fila.nSemestreCarrera}
                      onChange={(e) => handleChangeFila(idx, 'nSemestreCarrera', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  ) : fila.nSemestreCarrera}
                </td>
                <td className="p-2 text-center border">
                  {modoEdicion ? (
                    <input
                      type="number"
                      value={fila.ramosAprobados}
                      onChange={(e) => handleChangeFila(idx, 'ramosAprobados', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  ) : fila.ramosAprobados}
                </td>
                <td className="p-2 text-center border">
                  {modoEdicion ? (
                    <input
                      type="number"
                      value={fila.ramosReprobados}
                      onChange={(e) => handleChangeFila(idx, 'ramosReprobados', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  ) : fila.ramosReprobados}
                </td>
                <td className="p-2 text-center border">
                  {modoEdicion ? (
                    <input
                      type="number"
                      value={fila.ramosEliminados}
                      onChange={(e) => handleChangeFila(idx, 'ramosEliminados', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  ) : fila.ramosEliminados}
                </td>
                <td className="p-2 text-center border">
                  {modoEdicion ? (
                    <input
                      type="number"
                      value={fila.totalRamos}
                      readOnly
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center bg-gray-100"
                    />
                  ) : fila.totalRamos}
                </td>
                <td className="p-2 border">
                  {modoEdicion ? (
                    <input
                      type="text"
                      value={fila.observaciones}
                      onChange={(e) => handleChangeFila(idx, 'observaciones', e.target.value)}
                      placeholder="Observaciones..."
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (fila.observaciones || '')}
                </td>
                {modoEdicion && (
                  <td className="p-2 text-center border">
                    <button
                      type="button"
                      onClick={() => handleGuardarFila(idx)}
                      disabled={accionFila?.index === idx}
                      className="px-3 py-1 bg-[var(--color-turquoise)] text-white rounded hover:opacity-90 disabled:opacity-60 mr-2"
                    >
                      {accionFila?.index === idx && accionFila?.tipo === 'guardar' ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminarFila(idx)}
                      disabled={accionFila?.index === idx}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:opacity-90 disabled:opacity-60"
                    >
                      {accionFila?.index === idx && accionFila?.tipo === 'eliminar' ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="p-4 text-center text-gray-500 border">
                No hay datos académicos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {(mensajeGlobal || errorGlobal) && (
        <div className="mt-3 text-sm">
          {mensajeGlobal && <div className="text-green-700 font-medium">{mensajeGlobal}</div>}
          {errorGlobal && <div className="text-red-700 font-medium">{errorGlobal}</div>}
        </div>
      )}
    </div>
  );
};
