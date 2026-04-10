/**
 * Sección de desempeño por semestre
 * Tabla detallada de ramos con comentarios y notas
 */
import React, { useEffect, useState } from 'react';
import type { Estudiante } from '../../../types';
import {
  useSemesterOptions,
  useSemesterPerformanceData,
  useSemesterStats
} from './hooks/useSemesterPerformance';
import { ramosCursadosService, historialAcademicoService } from '../../../services';
import jsPDF from 'jspdf';

interface SemesterPerformanceSectionProps {
  estudiante: Estudiante;
  modoEdicion: boolean;
  onCambioDesempeno?: () => void;
}

export const SemesterPerformanceSection: React.FC<SemesterPerformanceSectionProps> = ({ estudiante, modoEdicion, onCambioDesempeno }) => {
  const {
    semestresDisponibles,
    semestreActual,
    setSemestreActual,
    loadingSemestres
  } = useSemesterOptions(estudiante.id_estudiante);

  const {
    ramosSemestre,
    historialSemestre,
    loadingDatos
  } = useSemesterPerformanceData(estudiante, semestreActual);

  const [ramosEditable, setRamosEditable] = useState<any[]>([]);
  const [historialEditable, setHistorialEditable] = useState<any | null>(null);
  useEffect(() => {
    setRamosEditable(ramosSemestre);
  }, [ramosSemestre]);

  useEffect(() => {
    setHistorialEditable(historialSemestre);
  }, [historialSemestre]);

  const actualizarRamo = async (ramoId: string | number | undefined, cambios: Partial<any>) => {
    if (!ramoId) return;
    setRamosEditable((prev) => prev.map((r) => (r.id_ramo === ramoId ? { ...r, ...cambios } : r)));
    try {
      await ramosCursadosService.update(String(ramoId), cambios);
      if (onCambioDesempeno) onCambioDesempeno();
    } catch (error) {
      console.error('Error actualizando ramo', error);
      // Revertir si falla
      setRamosEditable(ramosSemestre);
    }
  };

  const { total, aprobados, reprobados, eliminados, promedio } = useSemesterStats(ramosSemestre, historialSemestre);
  const loading = loadingSemestres || loadingDatos;
  const sinHistorial = !historialEditable?.id_historial_academico;

  const crearHistorialSiNoExiste = async () => {
    if (!sinHistorial) return historialEditable;
    try {
      const nuevo = await historialAcademicoService.create({
        id_estudiante: estudiante.id_estudiante.toString(),
        año: semestreActual.año,
        semestre: semestreActual.semestre,
        nivel_educativo: estudiante.institucion?.nivel_educativo || 'Superior',
        comentarios_generales: '',
        dificultades: '',
        aprendizajes: ''
      });
      setHistorialEditable(nuevo);
      if (onCambioDesempeno) onCambioDesempeno();
      return nuevo;
    } catch (error) {
      console.error('Error creando historial académico', error);
      return null;
    }
  };

  const actualizarCampoHistorial = async (campo: string, valor: string) => {
    setHistorialEditable((prev: any) => ({ ...(prev || {}), [campo]: valor }));
    let historialId = historialEditable?.id_historial_academico;
    if (!historialId) {
      const creado = await crearHistorialSiNoExiste();
      historialId = creado?.id_historial_academico;
      if (!historialId) return;
    }
    try {
      await historialAcademicoService.update(historialId, { [campo]: valor });
      if (onCambioDesempeno) onCambioDesempeno();
    } catch (error) {
      console.error('Error actualizando historial académico', error);
    }
  };

  // Formatear notas parciales para mostrar
  const formatearNotasParciales = (notas: any) => {
    if (!notas) return '-';
    if (Array.isArray(notas)) return notas.join('; ');
    if (typeof notas === 'string') return notas;
    if (typeof notas === 'object') return Object.values(notas).join('; ');
    return String(notas);
  };

  // Determinar estado de aprobación
  const getEstadoAprobacion = (estado: string) => {
    const estadoLower = estado?.toLowerCase();
    if (estadoLower === 'aprobado' || estadoLower === 'a') return 'Aprobado';
    if (estadoLower === 'reprobado' || estadoLower === 'r') return 'Reprobado';
    if (estadoLower === 'eliminado' || estadoLower === 'e') return 'Eliminado';
    return estado || 'Sin definir';
  };

  const generarInformeSemestre = () => {
    const doc = new jsPDF();
    let y = 15;

    const addLine = (text: string, gap = 6, maxWidth = 180) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        doc.text(line, 14, y);
        y += gap;
        if (y > 280) {
          doc.addPage();
          y = 15;
        }
      });
    };

    const nombreEstudiante = estudiante.nombre || estudiante.nombres || 'Estudiante';
    const rut = estudiante.rut || '-';

    doc.setFontSize(16);
    addLine('Informe de Desempeno Academico', 10);
    doc.setFontSize(11);
    addLine(`Estudiante: ${nombreEstudiante}`);
    addLine(`RUT: ${rut}`);
    addLine(`Semestre: ${semestreActual.año}/${semestreActual.semestre}S`);
    addLine(`Fecha de emision: ${new Date().toLocaleDateString('es-CL')}`, 10);

    addLine('Ramos cursados:', 8);
    if (ramosEditable.length === 0) {
      addLine(' - No hay ramos registrados para este semestre.', 8);
    } else {
      // Dibujar tabla manual (sin autoTable) con columnas fijas
      const startX = 14;
      const colWidths = [10, 60, 16, 28, 22, 22, 28];
      const headers = ['#', 'Ramo', 'Oport.', 'Notas parciales', 'Promedio', 'Aprobacion', 'Comentarios'];

      const drawRow = (values: string[], isHeader = false) => {
        const paddingX = 2;
        const paddingY = isHeader ? 3 : 3;
        const lineHeight = 5;

        // Calcular alto de cada celda con wrap
        const cellTexts = values.map((val, idx) => {
          const width = colWidths[idx] - paddingX * 2;
          const text = isHeader ? val : (val || '-');
          const lines = doc.splitTextToSize(text, width);
          return { lines, width };
        });

        const maxLines = Math.max(...cellTexts.map((c) => c.lines.length || 1));
        const rowHeight = Math.max((maxLines * lineHeight) + paddingY * 2, isHeader ? 8 : 9);

        // Salto de página si no cabe
        if (y + rowHeight > 280) {
          doc.addPage();
          y = 15;
        }

        let x = startX;
        cellTexts.forEach((cell, idx) => {
          doc.rect(x, y, colWidths[idx], rowHeight);
          const lines = cell.lines;
          lines.forEach((line: string, lineIdx: number) => {
            const textY = y + paddingY + lineHeight * (lineIdx + 1) - (lineHeight - 4);
            doc.text(line, x + paddingX, textY);
          });
          x += colWidths[idx];
        });

        y += rowHeight;
      };

      drawRow(headers, true);

      ramosEditable.forEach((ramo, idx) => {
        const fila = [
          `${idx + 1}`,
          ramo.nombre_ramo || 'Sin nombre',
          `${ramo.oportunidad || 1}ra`,
          formatearNotasParciales(ramo.notas_parciales) || '-',
          ramo.promedio_final ? Number(ramo.promedio_final).toFixed(1) : '-',
          getEstadoAprobacion(ramo.estado),
          ramo.comentarios || '-'
        ];
        drawRow(fila);
      });
      y += 6;
    }

    addLine('Resumen del semestre:', 10);
    const resumenPromedio = promedio !== null ? promedio.toFixed(1) : '-';
    addLine(
      `   Inscritos: ${total} | Aprobados: ${aprobados} | Reprobados: ${reprobados} | Eliminados: ${eliminados} | Promedio semestre: ${resumenPromedio}`,
      10
    );

    addLine('Comentarios generales:', 8);
    addLine(`   ${historialEditable?.comentarios_generales || '-'}`, 8, 180);

    addLine('Principales dificultades:', 8);
    addLine(`   ${historialEditable?.dificultades || '-'}`, 8, 180);

    addLine('Principales aprendizajes:', 8);
    addLine(`   ${historialEditable?.aprendizajes || '-'}`, 8, 180);

    const fileSafeName = nombreEstudiante.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    doc.save(`informe-desempeno-${fileSafeName}-${semestreActual.año}-${semestreActual.semestre}s.pdf`);
  };

  return (
    <div>
      <div className="bg-[var(--color-turquoise)] text-white text-center font-bold text-xl py-3 mb-2">
        Desempeño Académico por semestre
      </div>
      <div className="bg-yellow-200 p-2 text-center font-semibold mb-4 border border-gray-300 text-sm flex justify-between items-center">
        <div></div>
        <div>
          Semestre {semestreActual.año}/{semestreActual.semestre}S
        </div>
        <div className="flex gap-2">
          <button
            onClick={generarInformeSemestre}
            className="px-3 py-1 bg-emerald-600 text-white rounded shadow text-sm hover:bg-emerald-700"
          >
            Generar informe
          </button>
          <select
            value={`${semestreActual.año}-${semestreActual.semestre}`}
            onChange={(e) => {
              const [año, semestre] = e.target.value.split('-').map(Number);
              console.log('🔄 Cambiando a semestre:', { año, semestre });
              setSemestreActual({ año, semestre });
            }}
            className="text-sm px-2 py-1 border border-gray-300 rounded bg-white"
          >
            {semestresDisponibles.length > 0 ? (
              semestresDisponibles.map(({ año, semestre }) => (
                <option key={`${año}-${semestre}`} value={`${año}-${semestre}`}>
                  {año}/{semestre}S
                </option>
              ))
            ) : (
              <option value={`${semestreActual.año}-${semestreActual.semestre}`}>
                {semestreActual.año}/{semestreActual.semestre}S
              </option>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-[2.5fr_1fr] gap-6 mb-8">
        <div>
          <table 
            className="w-full border-collapse"
            role="table"
            aria-label="Tabla de desempeño académico por ramo"
          >
            <thead>
              <tr>
                <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300 w-[5%]">N°</th>
                <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300 w-[35%]">Ramo</th>
                <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300 w-[8%]">Oport.</th>
                <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300 w-[27%]">Comentarios</th>
                <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300 w-[10%]">Notas parciales</th>
                <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300 w-[8%]">Promedio final</th>
                <th scope="col" className="bg-[var(--color-turquoise)] text-white p-3 text-left border border-gray-300 w-[12%]">Aprobación</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500 border">
                    Cargando ramos del semestre...
                  </td>
                </tr>
              ) : ramosEditable.length > 0 ? (
                ramosEditable.map((ramo, index) => (
                  <tr key={ramo.id_ramo || index}>
                    <td className="p-2 text-center border">{index + 1}</td>
                    <td className="p-2 border">
                      {modoEdicion ? (
                        <input 
                          type="text" 
                          value={ramo.nombre_ramo || ''} 
                          onChange={(e) => setRamosEditable((prev) => prev.map((r) => r.id_ramo === ramo.id_ramo ? { ...r, nombre_ramo: e.target.value } : r))}
                          onBlur={(e) => actualizarRamo(ramo.id_ramo, { nombre_ramo: e.target.value })}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        ramo.nombre_ramo || 'Sin nombre'
                      )}
                    </td>
                    <td className="p-2 text-center border">
                      {modoEdicion ? (
                        <select 
                          value={ramo.oportunidad || 1}
                          onChange={(e) => actualizarRamo(ramo.id_ramo, { oportunidad: Number(e.target.value) })}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded text-sm text-center"
                        >
                          <option value={1}>1ra</option>
                          <option value={2}>2da</option>
                          <option value={3}>3ra</option>
                          <option value={4}>4ta</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          (ramo.oportunidad || 1) === 1 
                            ? 'bg-blue-100 text-blue-800' 
                            : (ramo.oportunidad || 1) === 2
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(ramo.oportunidad || 1) === 1 ? '1ra' : 
                           (ramo.oportunidad || 1) === 2 ? '2da' : 
                           (ramo.oportunidad || 1) === 3 ? '3ra' : '4ta'}
                        </span>
                      )}
                    </td>
                    <td className="p-2 border">
                      {modoEdicion ? (
                        <textarea 
                          value={ramo.comentarios || ''}
                          onChange={(e) => actualizarRamo(ramo.id_ramo, { comentarios: e.target.value })}
                          className="w-full min-h-[120px] px-1.5 py-1 border border-gray-300 rounded text-xs resize-y"
                          placeholder="Agregar comentarios..."
                        />
                      ) : (
                        <div className="text-xs leading-tight whitespace-pre-wrap">{ramo.comentarios || '-'}</div>
                      )}
                    </td>
                    <td className="p-2 text-center border">
                      {modoEdicion ? (
                        <input 
                          type="text" 
                          value={formatearNotasParciales(ramo.notas_parciales)} 
                          onChange={(e) => actualizarRamo(ramo.id_ramo, { notas_parciales: e.target.value })}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded text-sm text-center"
                          placeholder="ej: 5.1; 3.8; 4.0"
                        />
                      ) : (
                        formatearNotasParciales(ramo.notas_parciales)
                      )}
                    </td>
                    <td className="p-2 text-center border font-semibold">
                      {modoEdicion ? (
                        <input 
                          type="number" 
                          value={ramo.promedio_final ?? ''} 
                          step="0.1"
                          min="1.0"
                          max="7.0"
                          onChange={(e) => actualizarRamo(ramo.id_ramo, { promedio_final: e.target.value ? Number(e.target.value) : null })}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded text-sm text-center"
                        />
                      ) : (
                        ramo.promedio_final ? Number(ramo.promedio_final).toFixed(1) : '-'
                      )}
                    </td>
                    <td className="p-2 text-center border">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        getEstadoAprobacion(ramo.estado) === 'Aprobado' 
                          ? 'bg-green-100 text-green-800' 
                          : getEstadoAprobacion(ramo.estado) === 'Reprobado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getEstadoAprobacion(ramo.estado)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500 border">
                    No hay ramos registrados para el semestre {semestreActual.año}/{semestreActual.semestre}S
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Panel de resumen */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Resumen Semestre {semestreActual.año}/{semestreActual.semestre}S</h3>
            
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{total}</div>
                <div className="text-sm text-gray-600 mt-1">Total inscritos</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{aprobados}</div>
                <div className="text-sm text-gray-600 mt-1">Total aprobados</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{reprobados}</div>
                <div className="text-sm text-gray-600 mt-1">Total reprobados</div>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">{eliminados}</div>
                <div className="text-sm text-gray-600 mt-1">Total eliminados</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{promedio !== null ? promedio.toFixed(1) : '-'}</div>
                <div className="text-sm text-gray-600 mt-1">Promedio semestre</div>
              </div>

              {historialSemestre && (
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">📊 Datos del historial guardado</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bloques de comentarios y análisis */}
      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-base font-semibold mb-3 text-gray-900">Comentarios generales</h3>
          <textarea 
            className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded resize-y"
            placeholder="Agregar comentarios generales del semestre..."
            disabled={!modoEdicion}
            value={historialEditable?.comentarios_generales || ''}
            onChange={(e) => {
              setHistorialEditable((prev: any) => ({ ...(prev || {}), comentarios_generales: e.target.value }));
              if (onCambioDesempeno) onCambioDesempeno();
            }}
            onBlur={(e) => actualizarCampoHistorial('comentarios_generales', e.target.value)}
          />
        </div>

        <div>
          <h3 className="text-base font-semibold mb-3 text-gray-900">Principales dificultades / desafíos</h3>
          <textarea 
            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded resize-y"
            placeholder="Agregar principales dificultades o desafíos del semestre..."
            disabled={!modoEdicion}
            value={historialEditable?.dificultades || ''}
            onChange={(e) => {
              setHistorialEditable((prev: any) => ({ ...(prev || {}), dificultades: e.target.value }));
              if (onCambioDesempeno) onCambioDesempeno();
            }}
            onBlur={(e) => actualizarCampoHistorial('dificultades', e.target.value)}
          />
        </div>

        <div>
          <h3 className="text-base font-semibold mb-3 text-gray-900">Principales aprendizajes / logros</h3>
          <textarea 
            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded resize-y"
            placeholder="Agregar principales aprendizajes o logros..."
            disabled={!modoEdicion}
            value={historialEditable?.aprendizajes || ''}
            onChange={(e) => {
              setHistorialEditable((prev: any) => ({ ...(prev || {}), aprendizajes: e.target.value }));
              if (onCambioDesempeno) onCambioDesempeno();
            }}
            onBlur={(e) => actualizarCampoHistorial('aprendizajes', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
