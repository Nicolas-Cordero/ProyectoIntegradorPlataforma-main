import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp as TrendingIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  ExitToApp as RetiradoIcon,
  NewReleases as NuevosIcon,
} from '@mui/icons-material';
import { TypingText } from '../components/common/TypingText';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useEstudiantes } from '../hooks/useEstudiantes';
import { estudianteService } from '../services';
import type { Generacion, EstadoEstudiante, Genero } from '../types';
import {
  EstadoPieChart,
  GeneracionBarChart,
  SegmentedBar,
  CohorteTable,
  KpiCard,
  Section,
  fmtNum,
  fmtPct,
  ESTADO_LABELS,
  ESTADO_COLORS,
  ESTADO_ORDER,
} from '../components/features/estadisticas';
import type { PieItem, CohorteRow } from '../components/features/estadisticas';

// ── Clasificación Activo / No-Activo ──────────────────────────────────────────
// Activo   : ACTIVO — becario actualmente cursando con beca vigente
// No-Activo: TITULADO, EGRESADO, RETIRADO, ELIMINADO, SUSPENDIDO
//   • TITULADO/EGRESADO : completaron la educación superior y salieron del programa
//   • RETIRADO/ELIMINADO: salieron del programa antes de completarlo
//   • SUSPENDIDO : beca temporalmente suspendida; no reciben beneficios activos.
//     Es el estado más ambiguo (el becario puede seguir inscrito en la universidad),
//     pero se clasifica como No-Activo porque no participa activamente del programa de becas.
//
// Nota sobre el backend: el endpoint GET /estudiante no soporta filtrado por estado.
// El filtrado se realiza en el cliente sobre el listado completo ya cargado.

const ESTADOS_ACTIVOS: EstadoEstudiante[]    = ['ACTIVO'];
const ESTADOS_NO_ACTIVOS: EstadoEstudiante[] = ['TITULADO', 'EGRESADO', 'SUSPENDIDO', 'RETIRADO', 'ELIMINADO'];

type Filtro = 'ACTIVOS' | 'NO_ACTIVOS' | 'TODOS';

const FILTRO_LABELS: Record<Filtro, string> = {
  ACTIVOS:    'Activos',
  NO_ACTIVOS: 'No activos',
  TODOS:      'Todos',
};

const GENERO_LABELS: Record<Genero, string> = {
  FEMENINO:   'Femenino',
  MASCULINO:  'Masculino',
  NO_BINARIO: 'No binario',
};

const GENERO_COLORS: Record<Genero, string> = {
  FEMENINO:   '#C7654F',
  MASCULINO:  '#7B8FD4',
  NO_BINARIO: '#EEB35D',
};

export function EstadisticasPage() {
  const { estudiantes, loading, error, refresh } = useEstudiantes();
  const [generaciones, setGeneraciones] = useState<Generacion[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('ACTIVOS');

  useEffect(() => {
    estudianteService.getGenerations()
      .then(setGeneraciones)
      .catch(() => {});
  }, []);

  // Mapa generacion_id → año para mostrar años legibles
  const genYearMap = useMemo(() => {
    const m = new Map<number, number>();
    generaciones.forEach(g => m.set(g.id, g.año));
    return m;
  }, [generaciones]);

  // Conteos globales (sobre todos los estudiantes, no filtrados) para las etiquetas del selector
  const globalCounts = useMemo(() => ({
    ACTIVOS:    estudiantes.filter(e => ESTADOS_ACTIVOS.includes(e.estado)).length,
    NO_ACTIVOS: estudiantes.filter(e => ESTADOS_NO_ACTIVOS.includes(e.estado)).length,
    TODOS:      estudiantes.length,
  }), [estudiantes]);

  // Subconjunto filtrado según selector (filtrado en cliente; el endpoint no soporta estado como query param)
  const filteredEstudiantes = useMemo(() => {
    if (filtro === 'ACTIVOS')    return estudiantes.filter(e => ESTADOS_ACTIVOS.includes(e.estado));
    if (filtro === 'NO_ACTIVOS') return estudiantes.filter(e => ESTADOS_NO_ACTIVOS.includes(e.estado));
    return estudiantes;
  }, [estudiantes, filtro]);

  // A. KPIs (calculados sobre el subconjunto filtrado)
  const kpis = useMemo(() => {
    const total = filteredEstudiantes.length;
    const byEstado = (est: EstadoEstudiante) => filteredEstudiantes.filter(e => e.estado === est).length;
    const activos   = byEstado('ACTIVO');
    const titulados = byEstado('TITULADO');
    const egresados = byEstado('EGRESADO');
    const retirados = byEstado('RETIRADO');
    const tasaDesercion = total > 0 ? (retirados / total) * 100 : 0;

    const genIds = filteredEstudiantes.map(e => e.generacion_id ?? 0).filter(id => id > 0);
    const maxGenId = genIds.length > 0 ? Math.max(...genIds) : 0;
    const nuevos = maxGenId > 0 ? filteredEstudiantes.filter(e => e.generacion_id === maxGenId).length : 0;
    const nuevosAño = genYearMap.get(maxGenId);

    return { total, activos, titulados, egresados, retirados, tasaDesercion, nuevos, nuevosAño };
  }, [filteredEstudiantes, genYearMap]);

  // C. Situación académica (sobre subconjunto filtrado)
  const estadoData = useMemo<PieItem[]>(() => {
    const total = filteredEstudiantes.length;
    if (total === 0) return [];
    return ESTADO_ORDER
      .map(est => ({
        label: ESTADO_LABELS[est],
        count: filteredEstudiantes.filter(e => e.estado === est).length,
        pct: (filteredEstudiantes.filter(e => e.estado === est).length / total) * 100,
        color: ESTADO_COLORS[est],
      }))
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [filteredEstudiantes]);

  // B. Género (sobre subconjunto filtrado)
  const generoData = useMemo(() => {
    const generos: Genero[] = ['FEMENINO', 'MASCULINO', 'NO_BINARIO'];
    return generos.map(g => ({
      label: GENERO_LABELS[g],
      count: filteredEstudiantes.filter(e => e.genero === g).length,
      color: GENERO_COLORS[g],
    }));
  }, [filteredEstudiantes]);

  // Becarios por generación (sobre subconjunto filtrado)
  const porGeneracion = useMemo(() => {
    const counts = new Map<number, number>();
    filteredEstudiantes.forEach(e => {
      const id = e.generacion_id ?? 0;
      if (id > 0) counts.set(id, (counts.get(id) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([genId, count]) => ({
        label: String(genYearMap.get(genId) ?? genId),
        count,
      }))
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }, [filteredEstudiantes, genYearMap]);

  // G. Cohorte: por generación × estado (sobre subconjunto filtrado)
  const cohorteData = useMemo(() => {
    const genIds = [
      ...new Set(filteredEstudiantes.map(e => e.generacion_id ?? 0).filter(id => id > 0)),
    ].sort((a, b) => (genYearMap.get(a) ?? a) - (genYearMap.get(b) ?? b));

    const presentStates = ESTADO_ORDER.filter(est => filteredEstudiantes.some(e => e.estado === est));

    const rows: CohorteRow[] = genIds.map(genId => {
      const cohort = filteredEstudiantes.filter(e => e.generacion_id === genId);
      const counts: Record<string, number> = {};
      presentStates.forEach(est => {
        counts[est] = cohort.filter(e => e.estado === est).length;
      });
      return { año: genYearMap.get(genId) ?? genId, total: cohort.length, counts };
    });

    return { presentStates, rows };
  }, [filteredEstudiantes, genYearMap]);

  // ── UI states ─────────────────────────────────────────────────────────────

  if (loading) return <LoadingSpinner fullScreen message="Cargando estadísticas..." />;
  if (error)   return <ErrorMessage fullScreen title="Error al cargar estadísticas" message={error} onRetry={refresh} />;

  const isEmpty = estudiantes.length === 0;
  const isFilteredEmpty = !isEmpty && filteredEstudiantes.length === 0;

  // Etiqueta del KPI "total" varía según el filtro activo
  const totalLabel =
    filtro === 'ACTIVOS'    ? 'Total activos' :
    filtro === 'NO_ACTIVOS' ? 'Total no activos' :
    'Total histórico';

  // Texto del subtítulo de deserción varía según el filtro (no se muestra para ACTIVOS; sería 0)
  const subtituloDesercion =
    filtro === 'NO_ACTIVOS' ? 'Retirados / no activos' : 'Retirados / total';

  return (
    <div className="min-h-screen bg-[#FFFBF0]/90 py-8 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div
          className="rounded-2xl p-6 md:p-10 mb-8 text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #65B39B 0%, #4a9e87 40%, #C7654F 100%)',
            boxShadow: '0 8px 32px rgba(101,179,155,0.35)',
          }}
        >
          <div className="absolute -top-10 -right-10 w-[200px] h-[200px] rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-[60px] -left-5 w-[250px] h-[250px] rounded-full bg-white/[0.04] pointer-events-none" />
          <div className="flex items-center gap-4 mb-2">
            <TrendingIcon style={{ fontSize: 36 }} />
            <TypingText
              component="h1"
              text="Estadísticas"
              startDelayMs={0}
              charDelayMs={1}
              sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, fontWeight: 800, m: 0 }}
            />
          </div>
          <p className="text-white/85 text-base">
            Programa de becas · Fundación Carmen Goudie · datos en vivo
          </p>
        </div>

        {isEmpty ? (
          <div
            className="rounded-xl bg-white p-12 text-center"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
          >
            <PeopleIcon style={{ fontSize: 48, color: '#9E9E9E' }} />
            <p className="text-lg font-semibold text-gray-500 mt-4">No hay becarios registrados</p>
            <p className="text-sm text-gray-400 mt-1">
              Las estadísticas se mostrarán cuando haya datos disponibles.
            </p>
          </div>
        ) : (
          <>
            {/* Selector de subconjunto */}
            <div className="mb-8 flex justify-center">
              <div
                className="inline-flex bg-white rounded-xl p-1 gap-1"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}
                role="tablist"
                aria-label="Filtrar becarios por estado"
              >
                {(['ACTIVOS', 'NO_ACTIVOS', 'TODOS'] as Filtro[]).map(f => (
                  <button
                    key={f}
                    role="tab"
                    aria-selected={filtro === f}
                    onClick={() => setFiltro(f)}
                    className={`py-2 px-5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      filtro === f
                        ? 'bg-[#65B39B] text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {FILTRO_LABELS[f]}
                    <span
                      className={`ml-1.5 text-xs font-normal ${
                        filtro === f ? 'text-white/70' : 'text-gray-400'
                      }`}
                    >
                      ({fmtNum(globalCounts[f])})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {isFilteredEmpty ? (
              <div
                className="rounded-xl bg-white p-12 text-center"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
              >
                <PeopleIcon style={{ fontSize: 48, color: '#9E9E9E' }} />
                <p className="text-lg font-semibold text-gray-500 mt-4">
                  No hay becarios en la categoría &ldquo;{FILTRO_LABELS[filtro]}&rdquo;
                </p>
              </div>
            ) : (
              <>
                {/* A. KPIs ─────────────────────────────────────────────────── */}
                {/*
                 * Visibilidad condicional según el filtro activo:
                 * - "En el programa": solo para Activos o Todos (sería 0 en No-Activos)
                 * - "Titulados + egresados", "Retirados", "Tasa de deserción":
                 *   solo para No-Activos o Todos (serían 0 en Activos y confundirían al usuario)
                 * - "Total" y "Última generación": siempre visibles, con etiqueta adaptada al filtro
                 *
                 * TODO-DATA: el esquema no distingue becarios en educación superior de los que
                 * están en enseñanza media (3.º/4.º medio) ni los no matriculados dentro del
                 * estado ACTIVO. Para los KPIs "Estudiando en ES" y "En enseñanza media"
                 * se necesitaría un campo adicional o nuevos valores en EstadoEstudiante.
                 */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                  <KpiCard
                    label={totalLabel}
                    value={kpis.total}
                    icon={PeopleIcon}
                    color="#65B39B"
                    bg="rgba(101,179,155,0.12)"
                  />
                  {(filtro === 'ACTIVOS' || filtro === 'TODOS') && (
                    <KpiCard
                      label="En el programa"
                      value={kpis.activos}
                      subtitle="Activos"
                      icon={SchoolIcon}
                      color="#7B8FD4"
                      bg="rgba(123,143,212,0.12)"
                    />
                  )}
                  {(filtro === 'NO_ACTIVOS' || filtro === 'TODOS') && (
                    <KpiCard
                      label="Titulados + egresados"
                      value={kpis.titulados + kpis.egresados}
                      subtitle={`T: ${fmtNum(kpis.titulados)} · E: ${fmtNum(kpis.egresados)}`}
                      icon={CheckCircleIcon}
                      color="#4CAF50"
                      bg="rgba(76,175,80,0.12)"
                    />
                  )}
                  {(filtro === 'NO_ACTIVOS' || filtro === 'TODOS') && (
                    <KpiCard
                      label="Retirados"
                      value={kpis.retirados}
                      icon={RetiradoIcon}
                      color="#9E9E9E"
                      bg="rgba(158,158,158,0.12)"
                    />
                  )}
                  {(filtro === 'NO_ACTIVOS' || filtro === 'TODOS') && (
                    <KpiCard
                      label="Tasa de deserción"
                      value={fmtPct(kpis.tasaDesercion)}
                      subtitle={subtituloDesercion}
                      icon={TrendingDownIcon}
                      color="#C7654F"
                      bg="rgba(199,101,79,0.12)"
                    />
                  )}
                  <KpiCard
                    label={kpis.nuevosAño ? `Generación ${kpis.nuevosAño}` : 'Última generación'}
                    value={kpis.nuevos}
                    subtitle="Becarios más recientes"
                    icon={NuevosIcon}
                    color="#EEB35D"
                    bg="rgba(238,179,93,0.12)"
                  />
                </div>

                {/* C. Situación académica + B. Género ─────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Section title="Situación académica actual">
                    <EstadoPieChart data={estadoData} />
                  </Section>

                  <Section title="Composición por género">
                    <SegmentedBar data={generoData} total={filteredEstudiantes.length} />
                  </Section>
                </div>

                {/* Becarios por generación de ingreso ─────────────────────── */}
                <div className="mb-6">
                  <Section title="Becarios por generación de ingreso">
                    <GeneracionBarChart data={porGeneracion} color="#65B39B" />
                  </Section>
                </div>

                {/* G. Estado actual por cohorte ────────────────────────────── */}
                <div className="mb-6">
                  <Section title="Estado actual por cohorte de ingreso">
                    <CohorteTable
                      presentStates={cohorteData.presentStates}
                      rows={cohorteData.rows}
                    />
                  </Section>
                </div>

                {/*
                 * Las secciones siguientes requieren datos que el backend no expone actualmente.
                 *
                 * TODO-BACKEND: Distribución por modalidad del liceo (TP / HC)
                 *   El campo liceo.especialidad no está disponible en GET /estudiante.
                 *   Requiere incluir la relación `liceo` en EstudianteRepository.findAllEstudiantes().
                 *
                 * TODO-BACKEND: Distribución por liceo de origen (nombre legible)
                 *   Solo se dispone del código RBD (rbd_liceo); el nombre requiere `liceo.nombre`.
                 *   Requiere incluir la relación `liceo` en findAllEstudiantes().
                 *
                 * TODO-BACKEND: Distribución por comuna de procedencia
                 *   Requiere `liceo.comuna` disponible en el listado general de estudiantes.
                 *
                 * TODO-BACKEND: Estadísticas de educación superior (carreras, institución, ciudad)
                 *   Requiere incluir `carreras { universidad }` en findAllEstudiantes().
                 *
                 * TODO-BACKEND: Cambio de carrera
                 *   Requiere la relación `carreras` (con flag de carrera activa/histórica)
                 *   disponible en el listado general.
                 *
                 * TODO-BACKEND: Egresados/titulados por institución
                 *   Requiere `carreras { universidad }` en el listado general.
                 *
                 * TODO-BACKEND: Retirados por liceo de origen
                 *   Requiere `liceo.nombre` en el listado general de estudiantes.
                 *
                 * TODO-DATA: Sobreduración promedio — requiere duración nominal por carrera y
                 *   fechas de ingreso/egreso reales. El esquema actual no expone estos datos
                 *   en el listado general.
                 *
                 * TODO-DATA: Flujo del año 2025 (transiciones de estado) — requiere historial de
                 *   cambios de estado con fecha. El esquema actual no registra ese historial.
                 *
                 * TODO-DATA: Intercambios — no existe campo de país de intercambio en el esquema.
                 *
                 * TODO-DATA: Apoyos académicos — no existe modelo de sesiones/tutorías en el esquema.
                 */}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default EstadisticasPage;
