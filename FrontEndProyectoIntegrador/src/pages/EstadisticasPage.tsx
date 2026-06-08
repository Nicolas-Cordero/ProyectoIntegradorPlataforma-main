import { useState, useEffect, useMemo } from 'react';
import type { ReactNode, ElementType } from 'react';
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

// ── Etiquetas y colores ───────────────────────────────────────────────────────

const ESTADO_LABELS: Record<EstadoEstudiante, string> = {
  ACTIVO:      'Estudiando',
  CONDICIONAL: 'Condicional',
  TITULADO:    'Titulado/a',
  EGRESADO:    'Egresado/a',
  SUSPENDIDO:  'Suspendido/a',
  RETIRADO:    'Retirado/a',
  ELIMINADO:   'Eliminado/a',
};

const ESTADO_COLORS: Record<EstadoEstudiante, string> = {
  ACTIVO:      '#65B39B',
  CONDICIONAL: '#EEB35D',
  TITULADO:    '#4CAF50',
  EGRESADO:    '#7B8FD4',
  SUSPENDIDO:  '#C7654F',
  RETIRADO:    '#9E9E9E',
  ELIMINADO:   '#BF360C',
};

const ESTADO_ORDER: EstadoEstudiante[] = [
  'ACTIVO', 'CONDICIONAL', 'TITULADO', 'EGRESADO', 'SUSPENDIDO', 'RETIRADO', 'ELIMINADO',
];

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

// ── Formatters ────────────────────────────────────────────────────────────────

const fmtNum = (n: number) => n.toLocaleString('es-CL');
const fmtPct = (n: number) => `${n.toFixed(1).replace('.', ',')}%`;

// ── Componentes de visualización ──────────────────────────────────────────────

interface BarItem { label: string; count: number; pct: number; color: string }

function HorizontalBars({ data }: { data: BarItem[] }) {
  const maxCount = Math.max(1, ...data.map(d => d.count));
  return (
    <div className="flex flex-col gap-3">
      {data.map(({ label, count, pct, color }) => (
        <div key={label}>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 truncate max-w-[60%]">{label}</span>
            <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
              {fmtNum(count)} · {fmtPct(pct)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-in-out"
              style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: color }}
              aria-label={`${label}: ${fmtNum(count)} (${fmtPct(pct)})`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function VerticalBars({ data, color = '#65B39B' }: { data: { label: string; count: number }[]; color?: string }) {
  const maxCount = Math.max(1, ...data.map(d => d.count));
  return (
    <div className="overflow-x-auto">
      <div
        className="flex items-end gap-1.5 h-[140px] pt-2"
        style={{ minWidth: data.length * 44 }}
        role="img"
        aria-label="Gráfico de barras por generación"
      >
        {data.map(({ label, count }) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1 min-w-[36px]">
            <span className="text-xs font-semibold text-gray-800">{fmtNum(count)}</span>
            <div
              className="w-full transition-[height] duration-500 ease-in-out"
              style={{
                height: `${(count / maxCount) * 110}px`,
                minHeight: 4,
                background: `linear-gradient(180deg, ${color} 0%, ${color}99 100%)`,
                borderRadius: '6px 6px 0 0',
              }}
              title={`${label}: ${fmtNum(count)}`}
            />
            <span className="text-[0.7rem] text-gray-500 text-center leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SegmentedBar({
  data,
  total,
}: {
  data: { label: string; count: number; color: string }[];
  total: number;
}) {
  const filtered = data.filter(d => d.count > 0);
  if (filtered.length === 0) return <p className="text-sm text-gray-400">Sin datos de género.</p>;
  return (
    <div>
      <div className="flex h-7 rounded-lg overflow-hidden gap-px" role="img" aria-label="Distribución por género">
        {filtered.map(d => (
          <div
            key={d.label}
            style={{ width: `${(d.count / total) * 100}%`, backgroundColor: d.color }}
            title={`${d.label}: ${fmtNum(d.count)} (${fmtPct((d.count / total) * 100)})`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
        {filtered.map(d => (
          <div key={d.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-sm text-gray-600">{d.label}</span>
            <span className="text-sm font-bold text-gray-800 ml-0.5">{fmtNum(d.count)}</span>
            <span className="text-xs text-gray-400">({fmtPct((d.count / total) * 100)})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tabla de cohortes ─────────────────────────────────────────────────────────

interface CohorteRow {
  año: number;
  total: number;
  counts: Record<string, number>;
}

function CohorteTable({
  presentStates,
  rows,
}: {
  presentStates: EstadoEstudiante[];
  rows: CohorteRow[];
}) {
  if (rows.length === 0) return <p className="text-sm text-gray-400">Sin datos de cohortes.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 font-semibold text-gray-600 whitespace-nowrap">Cohorte</th>
            <th className="text-right py-2 px-2 font-semibold text-gray-600 whitespace-nowrap">Total</th>
            {presentStates.map(est => (
              <th
                key={est}
                className="text-right py-2 px-2 font-semibold whitespace-nowrap"
                style={{ color: ESTADO_COLORS[est] }}
              >
                {ESTADO_LABELS[est]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ año, total, counts }) => (
            <tr key={año} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="py-2 pr-4 font-bold text-gray-800">{año}</td>
              <td className="py-2 px-2 text-right font-semibold text-gray-700">{fmtNum(total)}</td>
              {presentStates.map(est => {
                const count = counts[est] ?? 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <td key={est} className="py-2 px-2 text-right">
                    {count > 0 ? (
                      <>
                        <span className="font-semibold text-gray-800">{fmtNum(count)}</span>
                        <span className="text-xs text-gray-400 ml-1">({fmtPct(pct)})</span>
                      </>
                    ) : (
                      <span className="text-gray-300">–</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── KpiCard y Section ─────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ElementType;
  color: string;
  bg: string;
}) {
  const display = typeof value === 'number' ? fmtNum(value) : value;
  return (
    <div
      className="rounded-xl bg-white border border-black/5"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
      role="region"
      aria-label={`${label}: ${display}`}
    >
      <div className="flex flex-col gap-3 p-5">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
          <Icon style={{ color, fontSize: 24 }} />
        </div>
        <p className="text-[2.125rem] font-extrabold text-gray-800 leading-none">{display}</p>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-white" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
      <div className="p-6">
        <p className="text-base font-bold text-gray-800 mb-4">{title}</p>
        {children}
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export function EstadisticasPage() {
  const { estudiantes, loading, error, refresh } = useEstudiantes();
  const [generaciones, setGeneraciones] = useState<Generacion[]>([]);

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

  // A. KPIs
  const kpis = useMemo(() => {
    const total = estudiantes.length;
    const byEstado = (est: EstadoEstudiante) => estudiantes.filter(e => e.estado === est).length;
    const activos   = byEstado('ACTIVO') + byEstado('CONDICIONAL');
    const titulados = byEstado('TITULADO');
    const egresados = byEstado('EGRESADO');
    const retirados = byEstado('RETIRADO');
    const tasaDesercion = total > 0 ? (retirados / total) * 100 : 0;

    const genIds = estudiantes.map(e => e.generacion_id ?? 0).filter(id => id > 0);
    const maxGenId = genIds.length > 0 ? Math.max(...genIds) : 0;
    const nuevos = maxGenId > 0 ? estudiantes.filter(e => e.generacion_id === maxGenId).length : 0;
    const nuevosAño = genYearMap.get(maxGenId);

    return { total, activos, titulados, egresados, retirados, tasaDesercion, nuevos, nuevosAño };
  }, [estudiantes, genYearMap]);

  // C. Situación académica
  const estadoData = useMemo<BarItem[]>(() => {
    const total = estudiantes.length;
    if (total === 0) return [];
    return ESTADO_ORDER
      .map(est => ({
        label: ESTADO_LABELS[est],
        count: estudiantes.filter(e => e.estado === est).length,
        pct: (estudiantes.filter(e => e.estado === est).length / total) * 100,
        color: ESTADO_COLORS[est],
      }))
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [estudiantes]);

  // B. Género
  const generoData = useMemo(() => {
    const generos: Genero[] = ['FEMENINO', 'MASCULINO', 'NO_BINARIO'];
    return generos.map(g => ({
      label: GENERO_LABELS[g],
      count: estudiantes.filter(e => e.genero === g).length,
      color: GENERO_COLORS[g],
    }));
  }, [estudiantes]);

  // Becarios por generación
  const porGeneracion = useMemo(() => {
    const counts = new Map<number, number>();
    estudiantes.forEach(e => {
      const id = e.generacion_id ?? 0;
      if (id > 0) counts.set(id, (counts.get(id) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([genId, count]) => ({
        label: String(genYearMap.get(genId) ?? genId),
        count,
      }))
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }, [estudiantes, genYearMap]);

  // G. Cohorte: por generación × estado
  const cohorteData = useMemo(() => {
    const genIds = [
      ...new Set(estudiantes.map(e => e.generacion_id ?? 0).filter(id => id > 0)),
    ].sort((a, b) => (genYearMap.get(a) ?? a) - (genYearMap.get(b) ?? b));

    const presentStates = ESTADO_ORDER.filter(est => estudiantes.some(e => e.estado === est));

    const rows: CohorteRow[] = genIds.map(genId => {
      const cohort = estudiantes.filter(e => e.generacion_id === genId);
      const counts: Record<string, number> = {};
      presentStates.forEach(est => {
        counts[est] = cohort.filter(e => e.estado === est).length;
      });
      return { año: genYearMap.get(genId) ?? genId, total: cohort.length, counts };
    });

    return { presentStates, rows };
  }, [estudiantes, genYearMap]);

  // ── Estados de UI ─────────────────────────────────────────────────────────

  if (loading) return <LoadingSpinner fullScreen message="Cargando estadísticas..." />;
  if (error)   return <ErrorMessage fullScreen title="Error al cargar estadísticas" message={error} onRetry={refresh} />;

  const isEmpty = estudiantes.length === 0;

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
            {/* A. KPIs ─────────────────────────────────────────────────── */}
            {/*
             * TODO-DATA: el esquema no distingue becarios en educación superior de los que
             * están en enseñanza media (3.º/4.º medio) ni los no matriculados dentro del
             * estado ACTIVO. Para los KPIs "Estudiando en ES" y "En enseñanza media"
             * se necesitaría un campo adicional o nuevos valores en EstadoEstudiante.
             */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <KpiCard
                label="Total histórico"
                value={kpis.total}
                icon={PeopleIcon}
                color="#65B39B"
                bg="rgba(101,179,155,0.12)"
              />
              <KpiCard
                label="En el programa"
                value={kpis.activos}
                subtitle="Activos + condicionales"
                icon={SchoolIcon}
                color="#7B8FD4"
                bg="rgba(123,143,212,0.12)"
              />
              <KpiCard
                label="Titulados + egresados"
                value={kpis.titulados + kpis.egresados}
                subtitle={`T: ${fmtNum(kpis.titulados)} · E: ${fmtNum(kpis.egresados)}`}
                icon={CheckCircleIcon}
                color="#4CAF50"
                bg="rgba(76,175,80,0.12)"
              />
              <KpiCard
                label="Retirados"
                value={kpis.retirados}
                icon={RetiradoIcon}
                color="#9E9E9E"
                bg="rgba(158,158,158,0.12)"
              />
              <KpiCard
                label="Tasa de deserción"
                value={fmtPct(kpis.tasaDesercion)}
                subtitle="Retirados / total"
                icon={TrendingDownIcon}
                color="#C7654F"
                bg="rgba(199,101,79,0.12)"
              />
              <KpiCard
                label={kpis.nuevosAño ? `Nuevos ${kpis.nuevosAño}` : 'Última generación'}
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
                <HorizontalBars data={estadoData} />
              </Section>

              <Section title="Composición por género">
                <SegmentedBar data={generoData} total={estudiantes.length} />
              </Section>
            </div>

            {/* Becarios por generación de ingreso ─────────────────────── */}
            <div className="mb-6">
              <Section title="Becarios por generación de ingreso">
                <VerticalBars data={porGeneracion} color="#65B39B" />
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
      </div>
    </div>
  );
}

export default EstadisticasPage;
