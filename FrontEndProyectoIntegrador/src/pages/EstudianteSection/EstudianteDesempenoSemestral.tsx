import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { School as SchoolIcon } from '@mui/icons-material';
import { Select, Alert, Spinner } from '../../components/ui';
import type { EstudianteOutletContext } from './EstudianteDetail';
import { carreraAvanceService, ramoAvanceService } from '../../services';
import type { CarreraAvanceDto } from '../../services/carrera-avance.service';
import type { BackendSemestre, TipoSemestre } from '../../services/semestre-avance.service';
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

function semLabel(year: number, tipo: TipoSemestre, codigo: CodigoSemUI): string {
  if (tipo === 'REGULAR') return `${year} — Semestre ${codigo}`;
  return `${year} — Rec. ${codigo === 'INVIERNO' ? 'Invierno' : 'Verano'}`;
}

// Mes central aproximado de cada período académico (para ordenar cronológicamente
// y elegir el semestre más cercano a la fecha actual).
const MES_CENTRAL: Record<CodigoSemUI, number> = {
  '1':        4,  // mayo (marzo–julio)
  'INVIERNO': 6,  // julio
  '2':        9,  // octubre (agosto–diciembre)
  'VERANO':   11, // diciembre (en la práctica enero siguiente)
};

function fechaRepresentativa(year: number, codigo: CodigoSemUI): number {
  return new Date(year, MES_CENTRAL[codigo], 1).getTime();
}

// La nota final puede llegar como string desde Prisma Decimal. Normaliza a number | null.
function normalizarNota(valor: number | string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return isNaN(n) ? null : n;
}

function notaColor(nota: number | null): string {
  if (nota === null) return 'text-gray-300';
  return nota >= NOTA_APROBACION ? 'text-green-600' : 'text-red-500';
}

const ESTADO_CHIP: Record<EstadoRamoAvance, { bg: string; text: string; label: string }> = {
  APROBADO:  { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprobado'  },
  REPROBADO: { bg: 'bg-red-100',   text: 'text-red-700',   label: 'Reprobado' },
  CURSANDO:  { bg: 'bg-blue-100',  text: 'text-blue-700',  label: 'Cursando'  },
  ELIMINADO: { bg: 'bg-gray-100',  text: 'text-gray-500',  label: 'Eliminado' },
};

// ─── Tipos UI ─────────────────────────────────────────────────────────────────

interface RamoUI {
  id: number;
  nombre: string;
  estado: EstadoRamoAvance;
  intento: number;
  nota_final: number | null;
}

interface SemestreUI {
  semestre_id: number;
  year: number;
  codigo: CodigoSemUI;
  tipo: TipoSemestre;
  ramos: RamoUI[];
}

function esAbierto(sem: SemestreUI): boolean {
  return sem.ramos.some(r => r.estado === 'CURSANDO');
}

function agruparSemestres(ramos: RamoAvanceDto[]): SemestreUI[] {
  const semestresMap = new Map<number, SemestreUI>();

  for (const r of ramos) {
    const { semestre_id, year, semestre, tipo } = r.semestre;
    if (!semestresMap.has(semestre_id)) {
      semestresMap.set(semestre_id, {
        semestre_id,
        year,
        codigo: BACKEND_TO_UI[semestre],
        tipo,
        ramos: [],
      });
    }
    semestresMap.get(semestre_id)!.ramos.push({
      id:         r.id,
      nombre:     r.nombre,
      estado:     r.estado,
      intento:    r.intento,
      nota_final: normalizarNota(r.nota_final),
    });
  }

  return Array.from(semestresMap.values()).sort((a, b) =>
    fechaRepresentativa(a.year, a.codigo) - fechaRepresentativa(b.year, b.codigo)
  );
}

function semestrePorDefecto(semestres: SemestreUI[]): number | null {
  if (semestres.length === 0) return null;
  const hoy = Date.now();
  return semestres.reduce((mejor, s) =>
    Math.abs(fechaRepresentativa(s.year, s.codigo) - hoy) <
    Math.abs(fechaRepresentativa(mejor.year, mejor.codigo) - hoy)
      ? s : mejor
  ).semestre_id;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EstudianteDesempenoSemestral() {
  const { estudiante } = useOutletContext<EstudianteOutletContext>();
  const rut = estudiante.rut_estudiante;

  const [carreras, setCarreras] = useState<CarreraAvanceDto[]>([]);
  const [cargandoCarreras, setCargandoCarreras] = useState(true);
  const [errorCarreras, setErrorCarreras] = useState<string | null>(null);
  const [carreraSel, setCarreraSel] = useState<number | null>(null);

  const [semestres, setSemestres] = useState<SemestreUI[]>([]);
  const [cargandoSemestres, setCargandoSemestres] = useState(false);
  const [errorSemestres, setErrorSemestres] = useState<string | null>(null);
  const [semestreSel, setSemestreSel] = useState<number | null>(null);

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

  // ── Carga de semestres al seleccionar carrera ─────────────────────────────
  useEffect(() => {
    if (carreraSel === null) return;
    let cancelado = false;
    setCargandoSemestres(true);
    setErrorSemestres(null);
    setSemestres([]);
    setSemestreSel(null);
    ramoAvanceService.getByCarrera(carreraSel)
      .then(ramos => {
        if (cancelado) return;
        const sems = agruparSemestres(ramos);
        setSemestres(sems);
        setSemestreSel(semestrePorDefecto(sems));
      })
      .catch(() => { if (!cancelado) setErrorSemestres('No se pudieron cargar los semestres de la carrera.'); })
      .finally(() => { if (!cancelado) setCargandoSemestres(false); });
    return () => { cancelado = true; };
  }, [carreraSel]);

  // ── Datos derivados ───────────────────────────────────────────────────────
  const carreraActual    = carreras.find(c => c.codigo_carrera === carreraSel) ?? null;
  const semestreActual   = semestres.find(s => s.semestre_id === semestreSel) ?? null;
  const abierto          = semestreActual !== null && esAbierto(semestreActual);
  // Solo puede haber un semestre abierto por carrera
  const semestreAbierto  = semestres.find(esAbierto) ?? null;

  // Resumen de semestre cerrado: los ramos eliminados no cuentan para el promedio
  const ramosEvaluados = semestreActual?.ramos.filter(r => r.estado !== 'ELIMINADO') ?? [];
  const notas          = ramosEvaluados.map(r => r.nota_final).filter((n): n is number => n !== null);
  const promedio       = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : null;
  const aprobados      = ramosEvaluados.filter(r => r.estado === 'APROBADO').length;
  const reprobados     = ramosEvaluados.filter(r => r.estado === 'REPROBADO').length;
  const eliminados     = (semestreActual?.ramos.length ?? 0) - ramosEvaluados.length;

  // ─────────────────────────────────────────────────────────────────────────

  if (cargandoCarreras) {
    return <div className="flex justify-center py-20"><Spinner message="Cargando carreras..." /></div>;
  }

  return (
    <div>
      {/* Error global */}
      {errorCarreras && (
        <div className="mb-4">
          <Alert tipo="error" mensaje={errorCarreras} />
        </div>
      )}

      {/* Cabecera */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Desempeño Semestral</h2>
        <p className="text-base font-medium text-gray-600 mt-1.5">
          Visualización del rendimiento semestre a semestre{' '}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-sm font-semibold bg-gray-100 text-gray-500 rounded-full border border-gray-200 align-middle">
            solo lectura
          </span>
        </p>
      </div>

      {/* Estado vacío: sin carreras */}
      {!errorCarreras && carreras.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <p className="text-5xl mb-4">🎓</p>
          <h3 className="text-lg font-bold text-gray-700 mb-2">Sin carrera asociada</h3>
          <p className="text-base text-gray-400">
            Registra una carrera en la sección Avance Curricular para visualizar el desempeño semestral.
          </p>
        </div>
      )}

      {carreras.length > 0 && (
        <>
          {/* Selectores de carrera y semestre */}
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
                  <span className="text-sm font-semibold text-gray-700 truncate max-w-[220px]">{carreraActual?.nombre}</span>
                </div>
              )}

              {cargandoSemestres ? (
                <div className="flex items-center"><Spinner message="Cargando semestres…" /></div>
              ) : semestres.length > 0 ? (
                <div className="w-64">
                  <Select
                    etiqueta="Semestre"
                    valor={semestreSel ?? ''}
                    onChange={v => setSemestreSel(Number(v))}
                    opciones={semestres.map(s => ({
                      valor: s.semestre_id,
                      etiqueta: semLabel(s.year, s.tipo, s.codigo) + (esAbierto(s) ? '  · Abierto' : ''),
                    }))}
                    tamano="small"
                  />
                </div>
              ) : !errorSemestres && (
                <p className="text-sm text-gray-400">
                  Esta carrera no tiene semestres con ramos registrados.
                </p>
              )}

              {semestreAbierto && (
                <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                  En curso: {semLabel(semestreAbierto.year, semestreAbierto.tipo, semestreAbierto.codigo)}
                </span>
              )}
          </div>

          {errorSemestres && (
            <div className="mb-4">
              <Alert tipo="error" mensaje={errorSemestres} />
            </div>
          )}

          {/* Tabla de desempeño del semestre seleccionado */}
          {semestreActual && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Encabezado del semestre */}
              <div className={`px-8 py-5 border-b border-gray-100 flex items-center gap-3 flex-wrap ${abierto ? 'bg-blue-50' : 'bg-green-50'}`}>
                <p className="text-xl font-bold text-gray-800">
                  {semLabel(semestreActual.year, semestreActual.tipo, semestreActual.codigo)}
                </p>
                {semestreActual.tipo === 'RECUPERATIVO' && (
                  <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                    Recuperativo
                  </span>
                )}
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${abierto ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>
                  {abierto ? 'En curso' : '✓ Cerrado'}
                </span>
              </div>

              {abierto && (
                <div className="px-8 pt-5">
                  <Alert
                    tipo="info"
                    mensaje="Semestre en curso: se muestran las notas finales disponibles hasta el momento. Los datos son parciales."
                  />
                </div>
              )}

              <div className="px-8 py-6">
                <table className="w-full">
                  <thead>
                    <tr className={`text-base font-semibold text-gray-500 border-b-2 ${abierto ? 'border-blue-100' : 'border-gray-200'}`}>
                      <th className="py-3 pr-6 text-left">Ramo</th>
                      <th className="py-3 px-6 text-center w-36">Nota final</th>
                      {!abierto && (
                        <th className="py-3 pl-6 text-center w-36">Estado</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {semestreActual.ramos.map((ramo, idx) => (
                      <tr
                        key={ramo.id}
                        className={`border-b border-gray-100 last:border-0 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                      >
                        <td className="py-4 pr-6">
                          <span className="text-base font-semibold text-gray-800">{ramo.nombre}</span>
                          {ramo.intento > 1 && (
                            <span className="ml-2 text-sm text-gray-400">{ramo.intento}° intento</span>
                          )}
                        </td>
                        <td className={`py-4 px-6 text-center text-xl font-bold tabular-nums ${notaColor(ramo.nota_final)}`}>
                          {ramo.nota_final !== null ? ramo.nota_final.toFixed(1) : '—'}
                        </td>
                        {!abierto && (
                          <td className="py-4 pl-6 text-center">
                            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${ESTADO_CHIP[ramo.estado].bg} ${ESTADO_CHIP[ramo.estado].text}`}>
                              {ESTADO_CHIP[ramo.estado].label}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Resumen al pie — solo semestre cerrado */}
                {!abierto && (
                  <div className="mt-6 pt-5 border-t-2 border-gray-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-green-100 text-green-700">
                        {aprobados} aprobado{aprobados !== 1 ? 's' : ''}
                      </span>
                      <span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-red-100 text-red-700">
                        {reprobados} reprobado{reprobados !== 1 ? 's' : ''}
                      </span>
                      {eliminados > 0 && (
                        <span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-gray-100 text-gray-500">
                          {eliminados} eliminado{eliminados !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base text-gray-500">Promedio del semestre</span>
                      <span className={`text-3xl font-bold tabular-nums ${promedio !== null ? (promedio >= NOTA_APROBACION ? 'text-green-600' : 'text-red-500') : 'text-gray-300'}`}>
                        {promedio !== null ? promedio.toFixed(1) : '—'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
