import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { School as SchoolIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { Select, Alert, Spinner } from '../../components/ui';
import type { EstudianteOutletContext } from './EstudianteDetail';
import { carreraAvanceService, ramoAvanceService, semestreAvanceService, historialEstadoCarreraService } from '../../services';
import { descargarPdf } from '../../utils/pdfDownload';
import { useSnackbar } from '../../hooks/useSnackbar';
import type { CarreraAvanceDto } from '../../services/carrera-avance.service';
import type { BackendSemestre, TipoSemestre, SemestreDto } from '../../services/semestre-avance.service';
import type { RamoAvanceDto, EstadoRamoAvance } from '../../services/ramo-avance.service';

// ─── Constantes / helpers de mapeo ────────────────────────────────────────────

const NOTA_APROBACION = 4;

type CodigoSemUI = '1' | '2' | 'INVIERNO' | 'VERANO';

const BACKEND_TO_UI: Record<BackendSemestre, CodigoSemUI> = {
  PRIMER_SEMESTRE:  '1',
  SEGUNDO_SEMESTRE: '2',
  INVIERNO:         'INVIERNO',
  VERANO:           'VERANO',
};

const ORDEN_SEMESTRE: Record<CodigoSemUI, number> = {
  '1':        0,
  'INVIERNO': 1,
  '2':        2,
  'VERANO':   3,
};

function tipoLabel(tipo: TipoSemestre, codigo: CodigoSemUI): string {
  if (tipo === 'REGULAR') return codigo === '1' ? 'Primer semestre' : 'Segundo semestre';
  return `Rec. ${codigo === 'INVIERNO' ? 'Invierno' : 'Verano'}`;
}

function normalizarNota(valor: number | string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return isNaN(n) ? null : n;
}

// ─── Tipos UI ─────────────────────────────────────────────────────────────────

interface RamoUI {
  id: number;
  estado: EstadoRamoAvance;
  nota_final: number | null;
}

interface SemestreUI {
  semestre_id: number;
  year: number;
  codigo: CodigoSemUI;
  tipo: TipoSemestre;
  ramos: RamoUI[];
  // Cierre explícito (backend, semestre_carrera.cerrado) — nunca derivado del
  // estado de los ramos, para que no dependa de qué haya cambiado el estudiante.
  cerrado: boolean;
}

function esAbierto(sem: SemestreUI): boolean {
  return sem.ramos.some(r => r.estado === 'CURSANDO');
}

function agruparSemestres(ramos: RamoAvanceDto[], linkedSemestres: SemestreDto[]): SemestreUI[] {
  const map = new Map<number, SemestreUI>();

  for (const s of linkedSemestres) {
    map.set(s.semestre_id, {
      semestre_id: s.semestre_id,
      year:        s.year,
      codigo:      BACKEND_TO_UI[s.semestre],
      tipo:        s.tipo,
      ramos:       [],
      cerrado:     s.cerrado,
    });
  }

  for (const r of ramos) {
    const { semestre_id, year, semestre, tipo } = r.semestre;
    if (!map.has(semestre_id)) {
      map.set(semestre_id, {
        semestre_id,
        year,
        codigo: BACKEND_TO_UI[semestre],
        tipo,
        ramos: [],
        // Sin fila en semestre_carrera (dato huérfano): no puede estar cerrado.
        cerrado: false,
      });
    }
    map.get(semestre_id)!.ramos.push({
      id:         r.id,
      estado:     r.estado,
      nota_final: normalizarNota(r.nota_final),
    });
  }
  return Array.from(map.values()).sort((a, b) =>
    a.year !== b.year
      ? a.year - b.year
      : ORDEN_SEMESTRE[a.codigo] - ORDEN_SEMESTRE[b.codigo]
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EstudianteDesempenoAcademico() {
  const { estudiante } = useOutletContext<EstudianteOutletContext>();
  const rut = estudiante.rut_estudiante;

  const [carreras, setCarreras] = useState<CarreraAvanceDto[]>([]);
  const [cargandoCarreras, setCargandoCarreras] = useState(true);
  const [errorCarreras, setErrorCarreras] = useState<string | null>(null);
  const [carreraSel, setCarreraSel] = useState<number | null>(null);

  const [semestres, setSemestres] = useState<SemestreUI[]>([]);
  const [cargandoSemestres, setCargandoSemestres] = useState(false);
  const [errorSemestres, setErrorSemestres] = useState<string | null>(null);

  const [semSupendidos, setSemSupendidos] = useState<number | null>(null);
  const [cargandoSemSusp, setCargandoSemSusp] = useState(false);

  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const { showError, SnackbarComponent } = useSnackbar();

  // ── Carga inicial de carreras ─────────────────────────────────────────────
  useEffect(() => {
    let cancelado = false;
    setCargandoCarreras(true);
    setErrorCarreras(null);
    carreraAvanceService.getByEstudiante(rut)
      .then(data => {
        if (cancelado) return;
        setCarreras(data);
        setCarreraSel(data[0]?.codigo_carrera ?? null);
      })
      .catch(() => { if (!cancelado) setErrorCarreras('No se pudieron cargar las carreras. Intenta de nuevo.'); })
      .finally(() => { if (!cancelado) setCargandoCarreras(false); });
    return () => { cancelado = true; };
  }, [rut]);

  // ── Carga de ramos al seleccionar carrera ─────────────────────────────────
  useEffect(() => {
    if (carreraSel === null) return;
    let cancelado = false;
    setCargandoSemestres(true);
    setErrorSemestres(null);
    setSemestres([]);
    Promise.all([
      ramoAvanceService.getByCarrera(carreraSel),
      semestreAvanceService.getByCarrera(carreraSel),
    ])
      .then(([ramos, linkedSemestres]) => {
        if (cancelado) return;
        setSemestres(agruparSemestres(ramos, linkedSemestres));
      })
      .catch(() => { if (!cancelado) setErrorSemestres('No se pudieron cargar los datos de la carrera.'); })
      .finally(() => { if (!cancelado) setCargandoSemestres(false); });
    return () => { cancelado = true; };
  }, [carreraSel]);

  // ── Carga de semestres suspendidos al seleccionar carrera ─────────────────
  useEffect(() => {
    if (carreraSel === null) return;
    let cancelado = false;
    setCargandoSemSusp(true);
    setSemSupendidos(null);
    historialEstadoCarreraService.getSemestresSupendidos(carreraSel)
      .then(count => { if (!cancelado) setSemSupendidos(count); })
      .catch(() => { if (!cancelado) setSemSupendidos(null); })
      .finally(() => { if (!cancelado) setCargandoSemSusp(false); });
    return () => { cancelado = true; };
  }, [carreraSel]);

  // ── Datos derivados ───────────────────────────────────────────────────────
  const carreraActual   = carreras.find(c => c.codigo_carrera === carreraSel) ?? null;
  const todosRamos      = semestres.flatMap(s => s.ramos);
  const totalRamos      = todosRamos.length;
  const semFinalizados  = semestres.filter(s => s.cerrado).length;
  const ramosAprobados  = todosRamos.filter(r => r.estado === 'APROBADO').length;
  const ramosReprobados = todosRamos.filter(r => r.estado === 'REPROBADO').length;
  const ramosCursando   = todosRamos.filter(r => r.estado === 'CURSANDO').length;
  const ramosEliminados = todosRamos.filter(r => r.estado === 'ELIMINADO').length;
  const notas           = todosRamos.map(r => r.nota_final).filter((n): n is number => n !== null);
  const promedioGeneral = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : null;

  const pct = (n: number) => totalRamos > 0 ? `${((n / totalRamos) * 100).toFixed(1)} %` : '—';

  async function handleDescargarPdf() {
    if (carreraSel === null) return;
    setDescargandoPdf(true);
    try {
      await descargarPdf(
        '/pdf-generator/academico',
        { codigo_carrera: carreraSel },
        `informe-academico-${rut}.pdf`,
      );
    } catch {
      showError('Error al generar el informe PDF');
    } finally {
      setDescargandoPdf(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  if (cargandoCarreras) {
    return <div className="flex justify-center py-20"><Spinner message="Cargando carreras..." /></div>;
  }

  return (
    <div>
      {errorCarreras && <div className="mb-4"><Alert tipo="error" mensaje={errorCarreras} /></div>}

      {/* Cabecera */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Desempeño Académico</h2>
          <p className="text-base font-medium text-gray-600 mt-1.5">
            Resumen general del rendimiento a lo largo de la carrera{' '}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-sm font-semibold bg-gray-100 text-gray-500 rounded-full border border-gray-200 align-middle">
              solo lectura
            </span>
          </p>
        </div>
        {carreraSel !== null && (
          <button
            onClick={handleDescargarPdf}
            disabled={descargandoPdf}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#3a7a6b] border border-[#65B39B]/40 rounded-lg hover:bg-[#65B39B]/10 disabled:opacity-50 transition-colors"
          >
            <PdfIcon sx={{ fontSize: 18 }} />
            {descargandoPdf ? 'Generando…' : 'Descargar informe académico'}
          </button>
        )}
      </div>

      {/* Estado vacío: sin carreras */}
      {!errorCarreras && carreras.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <p className="text-5xl mb-4">🎓</p>
          <h3 className="text-lg font-bold text-gray-700 mb-2">Sin carrera asociada</h3>
          <p className="text-base text-gray-400">
            Registra una carrera en la sección Avance Curricular para visualizar el desempeño académico.
          </p>
        </div>
      )}

      {carreras.length > 0 && (
        <>
          {/* Selector de carrera */}
          <div className="inline-flex flex-wrap items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-4 mb-6">
            {carreras.length > 1 ? (
              <div className="w-64">
                <Select
                  etiqueta="Carrera"
                  valor={carreraSel ?? ''}
                  onChange={v => setCarreraSel(Number(v))}
                  opciones={carreras.map(c => ({ valor: c.codigo_carrera, etiqueta: c.nombre }))}
                  tamano="small"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                <SchoolIcon sx={{ color: '#65B39B', fontSize: 18, flexShrink: 0 }} />
                <span className="text-sm font-semibold text-gray-700 truncate max-w-[280px]">
                  {carreraActual?.nombre}
                </span>
              </div>
            )}
          </div>

          {errorSemestres && <div className="mb-4"><Alert tipo="error" mensaje={errorSemestres} /></div>}

          {cargandoSemestres ? (
            <div className="flex justify-center py-16"><Spinner message="Cargando datos académicos..." /></div>
          ) : (
            <>
              {/* ── Tabla de resumen general ─────────────────────────── */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="px-8 py-5 border-b border-gray-100 bg-gray-50">
                  <p className="text-lg font-bold text-gray-800">Resumen general</p>
                </div>
                <div className="px-8 py-2">
                  <table className="w-full">
                    <tbody>
                      {([
                        {
                          label: 'Semestres finalizados',
                          valor: String(semFinalizados),
                        },
                        {
                          label: 'Semestres suspendidos',
                          valor: cargandoSemSusp ? '…' : (semSupendidos !== null ? String(semSupendidos) : '—'),
                        },
                        {
                          label: 'Duración total de la carrera',
                          valor: carreraActual ? `${carreraActual.duracion_sem} semestres` : '—',
                        },
                        {
                          label: 'Ramos aprobados',
                          valor: totalRamos > 0 ? String(ramosAprobados) : '—',
                          porcentaje: totalRamos > 0 ? pct(ramosAprobados) : undefined,
                          color: ramosAprobados > 0 ? 'text-green-600' : 'text-gray-800',
                        },
                        {
                          label: 'Ramos reprobados',
                          valor: totalRamos > 0 ? String(ramosReprobados) : '—',
                          porcentaje: totalRamos > 0 ? pct(ramosReprobados) : undefined,
                          color: ramosReprobados > 0 ? 'text-red-500' : 'text-gray-800',
                        },
                        {
                          label: 'Ramos en curso',
                          valor: totalRamos > 0 ? String(ramosCursando) : '—',
                          porcentaje: totalRamos > 0 ? pct(ramosCursando) : undefined,
                          color: ramosCursando > 0 ? 'text-blue-600' : 'text-gray-800',
                        },
                        {
                          label: 'Ramos eliminados',
                          valor: totalRamos > 0 ? String(ramosEliminados) : '—',
                          porcentaje: totalRamos > 0 ? pct(ramosEliminados) : undefined,
                          color: 'text-gray-700',
                        },
                        {
                          label: 'Promedio general',
                          valor: promedioGeneral !== null ? promedioGeneral.toFixed(2) : '—',
                          color: promedioGeneral !== null
                            ? (promedioGeneral >= NOTA_APROBACION ? 'text-green-600' : 'text-red-500')
                            : 'text-gray-300',
                          grande: true,
                        },
                      ] as { label: string; valor: string; porcentaje?: string; color?: string; italica?: boolean; grande?: boolean }[]).map(
                        ({ label, valor, porcentaje, color, italica, grande }) => (
                          <tr key={label} className="border-b border-gray-100 last:border-0">
                            <td className="py-4 pr-8 text-base text-gray-500 w-72">{label}</td>
                            <td
                              className={[
                                'py-4',
                                italica
                                  ? 'text-base italic text-gray-400'
                                  : grande
                                    ? `text-2xl font-bold tabular-nums ${color ?? 'text-gray-800'}`
                                    : `text-base font-semibold tabular-nums ${color ?? 'text-gray-800'}`,
                              ].join(' ')}
                            >
                              {valor}
                              {porcentaje && (
                                <span className="ml-6 inline-flex items-center px-3 py-0.5 text-sm font-semibold bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                                  {porcentaje}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Tabla de detalle por semestre ────────────────────── */}
              {semestres.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-8 py-5 border-b border-gray-100 bg-gray-50">
                    <p className="text-lg font-bold text-gray-800">Detalle por semestre</p>
                  </div>
                  <div className="px-8 py-6">
                    <table className="w-full">
                      <thead>
                        <tr className="text-base font-semibold text-gray-500 border-b-2 border-gray-200">
                          <th className="py-3 pr-4 text-left w-10">N°</th>
                          <th className="py-3 px-4 text-left">Tipo</th>
                          <th className="py-3 px-4 text-center">Estado</th>
                          <th className="py-3 px-4 text-center">Total ramos</th>
                          <th className="py-3 px-4 text-center text-green-700">Aprobados</th>
                          <th className="py-3 px-4 text-center text-red-500">Reprobados</th>
                          <th className="py-3 pl-4 text-center text-gray-400">Eliminados</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semestres.map((sem, idx) => {
                          const cerrado  = sem.cerrado;
                          const abierto  = esAbierto(sem);
                          const aprobados  = sem.ramos.filter(r => r.estado === 'APROBADO').length;
                          const reprobados = sem.ramos.filter(r => r.estado === 'REPROBADO').length;
                          const eliminados = sem.ramos.filter(r => r.estado === 'ELIMINADO').length;

                          return (
                            <tr
                              key={sem.semestre_id}
                              className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                            >
                              <td className="py-4 pr-4 text-base font-semibold text-gray-400 tabular-nums">
                                {idx + 1}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-base font-semibold text-gray-800">
                                    {tipoLabel(sem.tipo, sem.codigo)}
                                  </span>
                                  <span className="text-base font-semibold text-gray-600">{sem.year}</span>
                                  {sem.tipo === 'RECUPERATIVO' && (
                                    <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                                      Rec
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                                  abierto  ? 'bg-blue-100 text-blue-700'
                                  : cerrado ? 'bg-green-100 text-green-700'
                                           : 'bg-gray-100 text-gray-400'
                                }`}>
                                  {abierto ? 'En curso' : cerrado ? 'Cerrado' : 'Sin ramos'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center text-base font-semibold text-gray-700 tabular-nums">
                                {sem.ramos.length}
                              </td>
                              <td className="py-4 px-4 text-center text-base font-semibold tabular-nums text-green-600">
                                {aprobados}
                              </td>
                              <td className="py-4 px-4 text-center text-base font-semibold tabular-nums text-red-500">
                                {reprobados}
                              </td>
                              <td className="py-4 pl-4 text-center text-base font-semibold tabular-nums text-gray-400">
                                {eliminados}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                !errorSemestres && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <p className="text-base text-gray-400">
                      Esta carrera no tiene semestres con ramos registrados.
                    </p>
                  </div>
                )
              )}
            </>
          )}
        </>
      )}
      <SnackbarComponent />
    </div>
  );
}
