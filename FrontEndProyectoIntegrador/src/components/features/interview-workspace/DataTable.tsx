import { Fragment, useEffect, useState } from 'react';
import type { Estudiante, HistorialAcademico, RamosCursados } from '../../../types';
import { historialAcademicoService, ramosCursadosService } from '../../../services';
import {
  getEstudianteEmail,
  getEstudianteTelefono,
  getEstudianteDireccion,
  getEstudianteStatus,
  getEstudianteSemestre,
  getFamiliaNombreMadre,
  getFamiliaNombrePadre,
  getFamiliaDescripcionMadre,
  getFamiliaDescripcionPadre,
  getFamiliaHermanos,
  getFamiliaOtrosFamiliares,
  getFamiliaObservacionesHermanos,
  getFamiliaObservacionesOtrosFamiliares,
  getRamoSemestre,
  getRamoAño,
  getHistorialSemestre,
  getHistorialAño
} from '../../../utils/migration-helpers';

interface DataTableProps {
  tabId: string;
  sectionTitle: string;
  estudiante: Estudiante;
}

export function DataTable({
  tabId,
  sectionTitle,
  estudiante
}: DataTableProps) {
  const [historiales, setHistoriales] = useState<HistorialAcademico[]>(
    estudiante.historialesAcademicos || []
  );
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [ramos, setRamos] = useState<RamosCursados[]>(estudiante.ramosCursados || []);
  const [comentariosSemestre, setComentariosSemestre] = useState<Record<string, {
    generales: string;
    dificultades: string;
    aprendizajes: string;
  }>>({});

  // Normaliza cualquier nota disponible en el ramo a un número
  const getNotaRamo = (ramo: RamosCursados): number | null => {
    const rawNota =
      (ramo as any).promedio_final ??
      (ramo as any).nota_final ??
      (ramo as any).notaFinal ??
      (ramo as any).nota ??
      (ramo as any).promedio;

    if (rawNota !== null && rawNota !== undefined && rawNota !== '') {
      const parsed = Number(rawNota);
      if (!Number.isNaN(parsed)) return parsed;
    }

    const parciales = (ramo as any).notas_parciales;
    if (Array.isArray(parciales) && parciales.length > 0) {
      const validas = parciales.map(Number).filter(n => !Number.isNaN(n));
      if (validas.length > 0) {
        const promedioParciales = validas.reduce((acc, n) => acc + n, 0) / validas.length;
        return Number(promedioParciales.toFixed(1));
      }
    }

    return null;
  };

  useEffect(() => {
    const loadRamos = async () => {
      if (!estudiante.id_estudiante) return;
      try {
        console.log('🔄 [DataTable] Cargando ramos para estudiante:', estudiante.id_estudiante);
        const data = await ramosCursadosService.getByEstudiante(estudiante.id_estudiante.toString());
        if (Array.isArray(data) && data.length > 0) {
          console.log('✅ [DataTable] Ramos cargados:', data.length);
          setRamos(data);
          return;
        }
        console.log('📊 [DataTable] Ramos desde API vacío, usando embebidos');
        setRamos(estudiante.ramosCursados || []);
      } catch (error) {
        console.error('❌ [DataTable] Error cargando ramos:', error);
        setRamos(estudiante.ramosCursados || []);
      }
    };

    const loadHistorial = async () => {
      if (!estudiante.id_estudiante) {
        console.warn('⚠️ [DataTable] No hay ID de estudiante');
        return;
      }
      console.log('🔄 [DataTable] Cargando historial para estudiante:', estudiante.id_estudiante);
      setLoadingHistorial(true);
      try {
        const data = await historialAcademicoService.getByEstudiante(
          estudiante.id_estudiante.toString()
        );
        console.log('✅ [DataTable] Historial cargado:', data);
        if (Array.isArray(data)) {
          console.log('📊 [DataTable] Historiales (array):', data.length, 'registros');
          setHistoriales(data);
        } else if (data) {
          console.log('📊 [DataTable] Historial (objeto único)');
          setHistoriales([data as HistorialAcademico]);
        } else {
          console.log('📊 [DataTable] Sin datos de historial');
          setHistoriales([]);
        }
      } catch (err) {
        console.error('❌ [DataTable] Error cargando historial:', err);
        // Si falla, usar lo que venga embebido en el estudiante
        const embedded = estudiante.historialesAcademicos || [];
        console.log('📊 [DataTable] Usando historiales embebidos:', embedded.length, 'registros');
        setHistoriales(embedded);
      } finally {
        setLoadingHistorial(false);
      }
    };

    loadRamos();
    loadHistorial();
  }, [estudiante.id_estudiante, estudiante.historialesAcademicos, estudiante.ramosCursados]);
  // FUNCIÓN: Obtener contenido según la sección
  const getSectionContent = () => {
    switch (tabId) {
      case 'tab-info-personal':
        return renderInfoPersonal();
      case 'tab-avance-academico':
        return renderAvanceAcademico();
      case 'tab-historial':
        return renderHistorial();
      case 'tab-familia-data':
        return renderFamiliaData();
      default:
        return renderGenericData();
    }
  };

  // RENDER: Información personal
  const renderInfoPersonal = () => {
    const nombreCompleto = estudiante.nombre || 
      `${estudiante.nombres || ''} ${estudiante.apellidos || ''}`.trim();

    const formatearFecha = (fecha?: Date | string) => {
      if (!fecha) return 'No especificada';
      try {
        const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
        return date.toLocaleDateString('es-CL', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } catch {
        return 'No especificada';
      }
    };

    const datos = [
      { label: 'Nombre completo', value: nombreCompleto },
      { label: 'RUT', value: estudiante.rut || 'No especificado' },
      { label: 'Email', value: getEstudianteEmail(estudiante) },
      { label: 'Teléfono', value: getEstudianteTelefono(estudiante) },
      { label: 'Dirección', value: getEstudianteDireccion(estudiante) },
      { label: 'Fecha de nacimiento', value: formatearFecha(estudiante.fecha_de_nacimiento) },
      { label: 'Género', value: estudiante.genero || 'No especificado' },
      { label: 'Región', value: estudiante.region || 'No especificada' },
      { label: 'Tipo de estudiante', value: estudiante.tipo_de_estudiante || 'No especificado' },
    ];

    return (
      <div className="p-6">
        <div className="grid grid-cols-[1fr_2fr] gap-4 max-w-[600px]">
          {datos.map((item, index) => (
            <Fragment key={index}>
              <div className="text-sm font-medium text-gray-700 p-3 bg-gray-50 rounded-md">
                {item.label}
              </div>
              <div className="text-sm text-gray-800 p-3 bg-white border border-gray-200 rounded-md">
                {item.value}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    );
  };

  // RENDER: Avance académico
  const renderAvanceAcademico = () => {
    const getValor = (valor?: string | number | null) => {
      if (valor === null || valor === undefined || valor === '') return 'No especificada';
      return typeof valor === 'number' ? valor.toString() : valor;
    };

    // Calcular semestre actual desde historiales o ramos cursados
    const calcularSemestreActual = () => {
      try {
        console.log('📊 [DataTable] Calculando semestre actual...');
        const semestreEstudiante = getEstudianteSemestre(estudiante);
        console.log('📊 [DataTable] estudiante.semestre:', semestreEstudiante);
        
        if (semestreEstudiante) return semestreEstudiante;
        
        const historialesList = historiales || estudiante.historialesAcademicos || [];
        console.log('📊 [DataTable] Historiales disponibles:', historialesList.length);
        
        if (historialesList.length > 0) {
          const ordenados = [...historialesList]
            .filter(h => getHistorialAño(h) && getHistorialSemestre(h))
            .sort((a, b) => {
              if ((getHistorialAño(a) ?? 0) !== (getHistorialAño(b) ?? 0)) return (getHistorialAño(b) ?? 0) - (getHistorialAño(a) ?? 0);
              return (getHistorialSemestre(b) ?? 0) - (getHistorialSemestre(a) ?? 0);
            });
          console.log('📊 [DataTable] Historiales ordenados:', ordenados.length);
          if (ordenados.length > 0) {
            const ultimo = ordenados[0];
            console.log('📊 [DataTable] Último semestre:', `${getHistorialAño(ultimo)}/${getHistorialSemestre(ultimo)}`);
            return `${getHistorialAño(ultimo)}/${getHistorialSemestre(ultimo)}`;
          }
        }

        const ramosList = ramos.length ? ramos : (estudiante.ramosCursados || []);
        console.log('📊 [DataTable] Ramos cursados:', ramosList.length);
        if (ramosList.length > 0) {
          // Buscar el semestre más alto registrado (con o sin año)
          const ramosConSemestre = ramosList.filter(r => getRamoSemestre(r));
          console.log('📊 [DataTable] Ramos con semestre definido:', ramosConSemestre.length);
          
          if (ramosConSemestre.length > 0) {
            // Si hay años, buscar el periodo más reciente
            const conAño = ramosConSemestre.filter(r => getRamoAño(r));
            if (conAño.length > 0) {
              // Ordenar por año descendente, luego por semestre descendente
              const ordenados = [...conAño].sort((a, b) => {
                if ((getRamoAño(a) ?? 0) !== (getRamoAño(b) ?? 0)) return (getRamoAño(b) ?? 0) - (getRamoAño(a) ?? 0);
                return (getRamoSemestre(b) ?? 0) - (getRamoSemestre(a) ?? 0);
              });
              const ultimo = ordenados[0];
              console.log('📊 [DataTable] Último periodo con año:', `${getRamoAño(ultimo)}-${getRamoSemestre(ultimo)}`);
              return `${getRamoSemestre(ultimo)}`;
            }
            
            // Si no hay años, usar el semestre más alto
            const semestreMax = Math.max(...ramosConSemestre.map(r => getRamoSemestre(r) || 0));
            console.log('📊 [DataTable] Semestre más alto encontrado:', semestreMax);
            return semestreMax > 0 ? `${semestreMax}` : null;
          }
        }
        
        console.warn('⚠️ [DataTable] No se pudo calcular semestre actual');
        return null;
      } catch (error) {
        console.error('❌ [DataTable] Error calculando semestre:', error);
        return null;
      }
    };

    // Calcular promedio desde ramos cursados si no está definido
    const calcularPromedioActual = () => {
      try {
        console.log('📊 [DataTable] Calculando promedio actual...');
        
        if (estudiante.promedio !== undefined && estudiante.promedio !== null) {
          console.log('📊 [DataTable] Promedio directo:', estudiante.promedio);
          return estudiante.promedio;
        }
        if (estudiante.informacionAcademica?.promedio_acumulado !== undefined && estudiante.informacionAcademica?.promedio_acumulado !== null) {
          console.log('📊 [DataTable] Promedio acumulado:', estudiante.informacionAcademica.promedio_acumulado);
          return estudiante.informacionAcademica.promedio_acumulado;
        }
        if (estudiante.informacionAcademica?.promedio_1 !== undefined && estudiante.informacionAcademica?.promedio_1 !== null) {
          console.log('📊 [DataTable] Promedio 1:', estudiante.informacionAcademica.promedio_1);
          return estudiante.informacionAcademica.promedio_1;
        }

        const historialesList = historiales || estudiante.historialesAcademicos || [];
        if (historialesList.length > 0) {
          const conPromedio = historialesList.filter(h => h.promedio_semestre !== undefined && h.promedio_semestre !== null);
          console.log('📊 [DataTable] Historiales con promedio:', conPromedio.length);
          if (conPromedio.length > 0) {
            const suma = conPromedio.reduce((acc, h) => acc + Number(h.promedio_semestre), 0);
            const promedio = Number((suma / conPromedio.length).toFixed(1));
            console.log('📊 [DataTable] Promedio desde historiales:', promedio);
            return promedio;
          }
        }

        const ramosList = ramos.length ? ramos : (estudiante.ramosCursados || []);
        console.log('📊 [DataTable] Total ramos cursados:', ramosList.length);
        console.log('📊 [DataTable] Ramos detalle:', ramosList.map(r => ({ 
          nombre: r.nombre_ramo, 
          semestre: getRamoSemestre(r), 
          año: getRamoAño(r),
          promedio: getNotaRamo(r),
          estado: r.estado 
        })));
        const ramosConNota = ramosList
          .map(r => ({ ramo: r, nota: getNotaRamo(r) }))
          .filter(item => item.nota !== null && Number.isFinite(item.nota));
        console.log('📊 [DataTable] Ramos con nota válida:', ramosConNota.length);
        if (ramosConNota.length > 0) {
          const suma = ramosConNota.reduce((acc, item) => acc + (item.nota || 0), 0);
          const promedio = Number((suma / ramosConNota.length).toFixed(1));
          console.log('📊 [DataTable] Promedio calculado desde ramos:', promedio);
          return promedio;
        }

        console.warn('⚠️ [DataTable] No se pudo calcular promedio');
        return null;
      } catch (error) {
        console.error('❌ [DataTable] Error calculando promedio:', error);
        return null;
      }
    };

    const datosAcademicos = [
      {
        label: 'Carrera',
        value:
          estudiante.carrera ||
          estudiante.institucion?.carrera_especialidad ||
          estudiante.institucion?.nombre_institucion ||
          'No especificada'
      },
      {
        label: 'Universidad',
        value:
          estudiante.universidad ||
          estudiante.institucion?.nombre ||
          estudiante.institucion?.nombre_institucion ||
          'No especificada'
      },
      {
        label: 'Año de generación',
        value: getValor(estudiante.año_generacion ?? estudiante.generacion)
      },
      {
        label: 'Semestre actual',
        value: getValor(calcularSemestreActual())
      },
      {
        label: 'Promedio actual',
        value: getValor(calcularPromedioActual())
      },
      {
        label: 'Estado académico',
        value: getEstudianteStatus(estudiante) || estudiante.estado || 'No especificado'
      }
    ];

    // Log de debug
    console.log('📊 [DataTable] Renderizando avance académico');
    console.log('📊 [DataTable] Estudiante completo:', estudiante);
    console.log('📊 [DataTable] Ramos cursados:', (ramos.length || estudiante.ramosCursados?.length) || 0);
    console.log('📊 [DataTable] Historiales académicos:', (historiales || estudiante.historialesAcademicos || []).length);

    return (
      <div className="p-6">
        {/* Mensaje informativo de debug */}
        {(ramos.length === 0 && (!estudiante.ramosCursados || estudiante.ramosCursados.length === 0)) && 
         (!(historiales || estudiante.historialesAcademicos) || (historiales || estudiante.historialesAcademicos || []).length === 0) && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Información limitada</h4>
            <p className="text-xs text-yellow-700">
              No se encontraron ramos cursados ni historial académico para este estudiante.
              Los datos mostrados pueden estar incompletos.
            </p>
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-yellow-800 font-medium">Ver detalles técnicos</summary>
              <pre className="mt-2 p-2 bg-white rounded text-[10px] overflow-auto">
                {JSON.stringify({
                  id_estudiante: estudiante.id_estudiante,
                  ramosCursados: (ramos.length || estudiante.ramosCursados?.length) || 0,
                  historialesAcademicos: (historiales || estudiante.historialesAcademicos || []).length,
                  generacion: estudiante.generacion,
                  status: getEstudianteStatus(estudiante)
                }, null, 2)}
              </pre>
            </details>
          </div>
        )}
        
        <div className="grid grid-cols-[1fr_2fr] gap-4 max-w-[700px]">
          {datosAcademicos.map((item, index) => (
            <Fragment key={index}>
              <div className="text-sm font-medium text-gray-700 p-3 bg-[var(--color-turquoise)]/10 rounded-md">
                {item.label}
              </div>
              <div className="text-sm text-gray-800 p-3 bg-white border border-blue-200 rounded-md">
                {item.value}
              </div>
            </Fragment>
          ))}
        </div>

        {/* Indicador de progreso */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="m-0 mb-3 text-base font-semibold text-gray-800">
            📊 Progreso Académico
          </h4>
          
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm text-gray-500 min-w-[100px]">
              Avance de carrera:
            </span>
            <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-[var(--color-turquoise)] rounded"
                style={{ width: `${(() => {
                  const historialesList = historiales || estudiante.historialesAcademicos || [];
                  const conSemestre = historialesList.filter(h => getHistorialSemestre(h));
                  let porcentaje = 0;
                  if (conSemestre.length > 0) {
                    const conAño = conSemestre.filter(h => getHistorialAño(h));
                    if (conAño.length > 0) {
                      const semestresUnicos = new Set<string>();
                      conAño.forEach(h => semestresUnicos.add(`${getHistorialAño(h)}-${getHistorialSemestre(h)}`));
                      porcentaje = (semestresUnicos.size / 10) * 100;
                    } else {
                      const semestresUnicos = new Set<number>();
                      conSemestre.forEach(h => semestresUnicos.add(getHistorialSemestre(h)!));
                      porcentaje = (semestresUnicos.size / 10) * 100;
                    }
                  } else {
                    const ramosList = ramos.length ? ramos : (estudiante.ramosCursados || []);
                    const ramosConSemestre = ramosList.filter(r => getRamoSemestre(r));
                    if (ramosConSemestre.length > 0) {
                      const conAño = ramosConSemestre.filter(r => getRamoAño(r));
                      if (conAño.length > 0) {
                        const semestresUnicos = new Set<string>();
                        conAño.forEach(r => semestresUnicos.add(`${getRamoAño(r)}-${getRamoSemestre(r)}`));
                        porcentaje = (semestresUnicos.size / 10) * 100;
                      } else {
                        const semestreMax = Math.max(...ramosConSemestre.map(r => getRamoSemestre(r) || 0));
                        porcentaje = (semestreMax / 10) * 100;
                      }
                    }
                  }
                  return porcentaje.toFixed(0);
                })()}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-800">
              {(() => {
                const historialesList = historiales || estudiante.historialesAcademicos || [];
                const conSemestre = historialesList.filter(h => getHistorialSemestre(h));
                let porcentaje = 0;
                if (conSemestre.length > 0) {
                  const conAño = conSemestre.filter(h => getHistorialAño(h));
                  if (conAño.length > 0) {
                    const semestresUnicos = new Set<string>();
                    conAño.forEach(h => semestresUnicos.add(`${getHistorialAño(h)}-${getHistorialSemestre(h)}`));
                    porcentaje = (semestresUnicos.size / 10) * 100;
                  } else {
                    const semestresUnicos = new Set<number>();
                    conSemestre.forEach(h => semestresUnicos.add(getHistorialSemestre(h)!));
                    porcentaje = (semestresUnicos.size / 10) * 100;
                  }
                } else {
                  const ramosList = ramos.length ? ramos : (estudiante.ramosCursados || []);
                  const ramosConSemestre = ramosList.filter(r => getRamoSemestre(r));
                  if (ramosConSemestre.length > 0) {
                    const conAño = ramosConSemestre.filter(r => getRamoAño(r));
                    if (conAño.length > 0) {
                      const semestresUnicos = new Set<string>();
                      conAño.forEach(r => semestresUnicos.add(`${getRamoAño(r)}-${getRamoSemestre(r)}`));
                      porcentaje = (semestresUnicos.size / 10) * 100;
                    } else {
                      const semestreMax = Math.max(...ramosConSemestre.map(r => getRamoSemestre(r) || 0));
                      porcentaje = (semestreMax / 10) * 100;
                    }
                  }
                }
                return `${porcentaje.toFixed(0)}%`;
              })()}
            </span>
          </div>
          
          <div className="text-xs text-gray-500">
            * Basado en semestres cursados {(() => {
              const historialesList = historiales || estudiante.historialesAcademicos || [];
              const ramosList = ramos.length ? ramos : (estudiante.ramosCursados || []);
              if (historialesList.length > 0) return 'desde historial académico';
              if (ramosList.length > 0) return 'desde ramos cursados';
              return 'de carrera estimada en 10 semestres';
            })()}
          </div>
        </div>
      </div>
    );
  };

  // RENDER: Historial académico - Desempeño por semestre
  const renderHistorial = () => {
    const ramosList = ramos.length ? ramos : (estudiante.ramosCursados || []);
    
    if (loadingHistorial) {
      return (
        <div className="p-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="m-0 mb-3 text-base font-semibold text-gray-800">📚 Desempeño por Semestre</h4>
            <p className="m-0 text-sm text-gray-600">Cargando información...</p>
          </div>
        </div>
      );
    }

    // Agrupar ramos por semestre
    const ramosPorSemestre: Record<string, RamosCursados[]> = {};
    ramosList.forEach(ramo => {
      const semestreRamo = getRamoSemestre(ramo);
      if (semestreRamo !== undefined && semestreRamo !== null) {
        const añoRamo = getRamoAño(ramo);
        const key = añoRamo ? `${añoRamo}-${semestreRamo}` : `Semestre ${semestreRamo}`;
        if (!ramosPorSemestre[key]) {
          ramosPorSemestre[key] = [];
        }
        ramosPorSemestre[key].push(ramo);
      }
    });

    // Ordenar periodos de más reciente a más antiguo
    const periodosOrdenados = Object.keys(ramosPorSemestre).sort((a, b) => {
      const matchA = a.match(/^(\d{4})-(\d+)$/);
      const matchB = b.match(/^(\d{4})-(\d+)$/);
      
      if (matchA && matchB) {
        const [, añoA, semA] = matchA;
        const [, añoB, semB] = matchB;
        if (añoA !== añoB) return parseInt(añoB) - parseInt(añoA);
        return parseInt(semB) - parseInt(semA);
      }
      return b.localeCompare(a);
    });

    if (periodosOrdenados.length === 0) {
      return (
        <div className="p-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="m-0 mb-3 text-base font-semibold text-gray-800">📚 Desempeño por Semestre</h4>
            <p className="m-0 text-sm text-gray-600">Sin ramos cursados registrados para este estudiante.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="space-y-4">
          {periodosOrdenados.map((periodo, idx) => {
            const ramosDelPeriodo = ramosPorSemestre[periodo];
            const ramosConNota = ramosDelPeriodo
              .map(r => ({ ramo: r, nota: getNotaRamo(r) }))
              .filter(item => item.nota !== null && Number.isFinite(item.nota));
            const promedioSemestre = ramosConNota.length > 0
              ? Number((ramosConNota.reduce((sum, item) => sum + (item.nota || 0), 0) / ramosConNota.length).toFixed(1))
              : null;

            return (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Header del semestre */}
                <div className="p-4 bg-gradient-to-r from-[var(--color-turquoise)] to-blue-500 text-white">
                  <div className="flex justify-between items-center">
                    <h4 className="m-0 text-base font-semibold flex items-center gap-2">
                      📅 {periodo}
                    </h4>
                    <div className="text-right">
                      <div className="text-xs opacity-90">Promedio del semestre</div>
                      <div className="text-lg font-bold">
                        {promedioSemestre || 'Sin notas'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabla de ramos del semestre */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-600">
                        <th className="px-4 py-3">Asignatura</th>
                        <th className="px-4 py-3">Código</th>
                        <th className="px-4 py-3 text-center">Nota</th>
                        <th className="px-4 py-3 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {ramosDelPeriodo.map((ramo, ramoIdx) => {
                        const nota = getNotaRamo(ramo);
                        const estadoColor = 
                          ramo.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                          ramo.estado === 'reprobado' ? 'bg-red-100 text-red-800' :
                          ramo.estado === 'cursando' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800';

                        return (
                          <tr key={ramoIdx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900">{ramo.nombre_ramo || 'Sin nombre'}</td>
                            <td className="px-4 py-3 text-gray-700">{ramo.codigo_ramo || '—'}</td>
                            <td className="px-4 py-3 text-center font-semibold" style={{ color: nota !== null && nota >= 4.0 ? '#059669' : '#dc2626' }}>
                              {nota !== null ? nota.toFixed(1) : 'Sin nota'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoColor}`}>
                                {ramo.estado || 'Pendiente'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Comentarios del semestre */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
                  {(() => {
                    const current = comentariosSemestre[periodo] || { generales: '', dificultades: '', aprendizajes: '' };
                    const update = (field: 'generales' | 'dificultades' | 'aprendizajes', value: string) => {
                      setComentariosSemestre(prev => ({
                        ...prev,
                        [periodo]: { ...current, [field]: value }
                      }));
                    };

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-semibold text-gray-700">Comentarios generales</span>
                          <textarea
                            className="w-full min-h-[80px] border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Agregar comentarios generales del semestre..."
                            value={current.generales}
                            onChange={(e) => update('generales', e.target.value)}
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-semibold text-gray-700">Principales dificultades / desafíos</span>
                          <textarea
                            className="w-full min-h-[80px] border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Agregar principales dificultades o desafíos del semestre..."
                            value={current.dificultades}
                            onChange={(e) => update('dificultades', e.target.value)}
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-semibold text-gray-700">Principales aprendizajes / logros</span>
                          <textarea
                            className="w-full min-h-[80px] border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Agregar principales aprendizajes o logros..."
                            value={current.aprendizajes}
                            onChange={(e) => update('aprendizajes', e.target.value)}
                          />
                        </label>
                      </div>
                    );
                  })()}
                </div>

                {/* Footer con estadísticas */}
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>📚 Total de asignaturas: <strong>{ramosDelPeriodo.length}</strong></span>
                    <span>
                      ✅ Con nota: <strong>{ramosConNota.length}</strong> | 
                      ⏳ Sin nota: <strong>{ramosDelPeriodo.length - ramosConNota.length}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // RENDER: Información familiar
  const renderFamiliaData = () => {
    const familia = estudiante.familia;

    const formatTexto = (valor?: string | string[]) => {
      if (!valor) return 'Sin información';
      if (Array.isArray(valor)) {
        const limpio = valor.filter(Boolean);
        return limpio.length ? limpio.join('\n') : 'Sin información';
      }
      return valor;
    };

    const formatListado = (items?: unknown[]) => {
      if (!items || items.length === 0) return 'Sin información';

      const nombres = items
        .map((item) => {
          if (!item) return '';
          if (typeof item === 'string') return item;
          if (typeof item === 'object') return (item as any).nombre || (item as any).name || '';
          return '';
        })
        .filter(Boolean);

      if (nombres.length > 0) return nombres.join(', ');
      return `${items.length} registrado${items.length === 1 ? '' : 's'}`;
    };

    const formatObservacionesGenerales = () => {
      const obs = familia?.observaciones as any;
      if (!obs) return 'Sin observaciones';
      if (typeof obs === 'string') return obs;
      if (Array.isArray(obs)) {
        const limpio = obs.filter(Boolean);
        return limpio.length ? limpio.join('\n') : 'Sin observaciones';
      }
      if (Array.isArray(obs?.general)) {
        const limpio = obs.general.filter(Boolean);
        return limpio.length ? limpio.join('\n') : 'Sin observaciones';
      }
      return 'Sin observaciones';
    };

    if (!familia) {
      return (
        <div className="p-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-[700px]">
            <h4 className="m-0 mb-3 text-base font-semibold text-gray-800">
              👨‍👩‍👧‍👦 Información Familiar
            </h4>
            <p className="m-0 text-sm text-gray-600">
              Este estudiante aún no tiene información familiar registrada en el sistema.
            </p>
          </div>
        </div>
      );
    }

    const descripcionMadre = formatTexto(getFamiliaDescripcionMadre(familia));
    const descripcionPadre = formatTexto(getFamiliaDescripcionPadre(familia));
    const hermanosDetalle = formatListado(getFamiliaHermanos(familia));
    const otrosFamiliaresDetalle = formatListado(getFamiliaOtrosFamiliares(familia));
    const obsHermanos = formatTexto(getFamiliaObservacionesHermanos(familia));
    const obsOtros = formatTexto(getFamiliaObservacionesOtrosFamiliares(familia));
    const obsGenerales = formatObservacionesGenerales();

    return (
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 max-w-[900px]">
          {/* Información de los padres */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="m-0 mb-4 text-base font-semibold text-gray-800">
              👨‍👩‍👧‍👦 Información Familiar
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="m-0 mb-2 text-sm font-medium text-gray-700">
                  Madre
                </h5>
                <div className="text-sm text-gray-800">
                  {getFamiliaNombreMadre(familia) || 'No registrada'}
                  <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">
                    {descripcionMadre}
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="m-0 mb-2 text-sm font-medium text-gray-700">
                  Padre
                </h5>
                <div className="text-sm text-gray-800">
                  {getFamiliaNombrePadre(familia) || 'No registrado'}
                  <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">
                    {descripcionPadre}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-[1fr_2fr] gap-4">
            <div className="text-sm font-medium text-gray-700 p-3 bg-orange-50 rounded-md">
              Hermanos
            </div>
            <div className="text-sm text-gray-800 p-3 bg-white border border-orange-200 rounded-md">
              {hermanosDetalle}
              {obsHermanos !== 'Sin información' && (
                <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">{obsHermanos}</div>
              )}
            </div>

            <div className="text-sm font-medium text-gray-700 p-3 bg-orange-50 rounded-md">
              Otros familiares significativos
            </div>
            <div className="text-sm text-gray-800 p-3 bg-white border border-orange-200 rounded-md">
              {otrosFamiliaresDetalle}
              {obsOtros !== 'Sin información' && (
                <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">{obsOtros}</div>
              )}
            </div>

            <div className="text-sm font-medium text-gray-700 p-3 bg-orange-50 rounded-md">
              Observaciones generales
            </div>
            <div className="text-sm text-gray-800 p-3 bg-white border border-orange-200 rounded-md">
              <div className="whitespace-pre-line">{obsGenerales}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // RENDER: Datos genéricos
  const renderGenericData = () => {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="text-5xl mb-4">📊</div>
        <h3 className="m-0 mb-2 text-gray-800">
          {sectionTitle}
        </h3>
        <p className="m-0 text-sm">
          Los datos para esta sección se implementarán próximamente
        </p>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* HEADER DE LA SECCIÓN */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="m-0 mb-2 text-lg font-semibold text-gray-800">
          📊 {sectionTitle}
        </h3>
        <p className="m-0 text-sm text-gray-500">
          Información del estudiante {estudiante.nombre || 
            `${estudiante.nombres} ${estudiante.apellidos}`}
        </p>
      </div>

      {/* CONTENIDO DE LA SECCIÓN */}
      <div className="flex-1 overflow-y-auto">
        {getSectionContent()}
      </div>
    </div>
  );
};