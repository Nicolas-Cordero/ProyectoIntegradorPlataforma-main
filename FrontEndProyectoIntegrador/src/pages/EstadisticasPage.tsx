import {
  People as PeopleIcon,
  School as SchoolIcon,
  Chat as EntrevistaIcon,
  SupervisorAccount as TutorIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { TypingText } from '../components/common/TypingText';

// ── Datos dummy ──────────────────────────────────────────────────────────────

const KPI_CARDS = [
  { label: 'Estudiantes activos', value: 148, icon: PeopleIcon,     color: '#65B39B', bg: 'rgba(101,179,155,0.12)' },
  { label: 'Generaciones',        value: 6,   icon: SchoolIcon,     color: '#C7654F', bg: 'rgba(199,101,79,0.12)'  },
  { label: 'Entrevistas totales', value: 312, icon: EntrevistaIcon, color: '#EEB35D', bg: 'rgba(238,179,93,0.12)'  },
  { label: 'Tutores activos',     value: 9,   icon: TutorIcon,      color: '#7B8FD4', bg: 'rgba(123,143,212,0.12)' },
];

const ESTUDIANTES_POR_GENERACION = [
  { año: 2019, total: 18 },
  { año: 2020, total: 24 },
  { año: 2021, total: 29 },
  { año: 2022, total: 31 },
  { año: 2023, total: 26 },
  { año: 2024, total: 20 },
];

const ESTADOS = [
  { label: 'Activo',      value: 92, color: '#65B39B' },
  { label: 'Condicional', value: 21, color: '#EEB35D' },
  { label: 'Egresado',    value: 18, color: '#7B8FD4' },
  { label: 'Suspendido',  value: 9,  color: '#C7654F' },
  { label: 'Retirado',    value: 5,  color: '#9E9E9E' },
  { label: 'Titulado',    value: 3,  color: '#4CAF50' },
];

const ENTREVISTAS_POR_MES = [
  { mes: 'Ene', valor: 18 },
  { mes: 'Feb', valor: 24 },
  { mes: 'Mar', valor: 31 },
  { mes: 'Abr', valor: 27 },
  { mes: 'May', valor: 35 },
  { mes: 'Jun', valor: 22 },
];

const ULTIMAS_ENTREVISTAS = [
  { estudiante: 'María González', tutor: 'Carlos Pérez', fecha: '01/06/2026', estado: 'Completada' },
  { estudiante: 'Juan Muñoz',     tutor: 'Ana Torres',   fecha: '31/05/2026', estado: 'Completada' },
  { estudiante: 'Sofía Reyes',    tutor: 'Carlos Pérez', fecha: '30/05/2026', estado: 'Completada' },
  { estudiante: 'Diego Araya',    tutor: 'Luis Morales', fecha: '29/05/2026', estado: 'Pendiente'  },
  { estudiante: 'Camila Vega',    tutor: 'Ana Torres',   fecha: '28/05/2026', estado: 'Completada' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const maxGeneracion = Math.max(...ESTUDIANTES_POR_GENERACION.map(g => g.total));
const maxEntrevista = Math.max(...ENTREVISTAS_POR_MES.map(e => e.valor));
const totalEstados  = ESTADOS.reduce((s, e) => s + e.value, 0);

// ── Componentes pequeños ──────────────────────────────────────────────────────

function BarChart({ data, maxVal, color }: { data: { label: string; value: number }[]; maxVal: number; color: string }) {
  return (
    <div className="flex items-end gap-3 h-[140px] pt-2">
      {data.map(({ label, value }) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-gray-800">{value}</span>
          <div
            className="w-full transition-[height] duration-[400ms] ease-in-out"
            style={{
              height: `${(value / maxVal) * 110}px`,
              minHeight: '4px',
              background: `linear-gradient(180deg, ${color} 0%, ${color}99 100%)`,
              borderRadius: '6px 6px 0 0',
            }}
          />
          <span className="text-[0.7rem] text-gray-500">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function EstadisticasPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF0] py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div
          className="rounded-2xl p-6 md:p-10 mb-8 text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #65B39B 0%, #4a9e87 40%, #C7654F 100%)',
            boxShadow: '0 8px 32px rgba(101,179,155,0.35)',
          }}
        >
          {/* Círculos decorativos */}
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
            Resumen general de la plataforma · datos de ejemplo
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {KPI_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="rounded-xl bg-white border border-black/5"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
            >
              <div className="flex flex-col gap-3 p-5">
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: bg }}
                >
                  <Icon style={{ color, fontSize: 24 }} />
                </div>
                <p className="text-[2.125rem] font-extrabold text-gray-800 leading-none">{value}</p>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Fila 2: Estudiantes por generación + Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Estudiantes por generación */}
          <div
            className="rounded-xl bg-white"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
          >
            <div className="p-6">
              <p className="text-base font-bold text-gray-800 mb-4">Estudiantes por generación</p>
              <BarChart
                data={ESTUDIANTES_POR_GENERACION.map(g => ({ label: String(g.año), value: g.total }))}
                maxVal={maxGeneracion}
                color="#65B39B"
              />
            </div>
          </div>

          {/* Distribución por estado */}
          <div
            className="rounded-xl bg-white"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
          >
            <div className="p-6">
              <p className="text-base font-bold text-gray-800 mb-4">Distribución por estado</p>
              <div className="flex flex-col gap-3">
                {ESTADOS.map(({ label, value, color }) => {
                  const pct = Math.round((value / totalEstados) * 100);
                  return (
                    <div key={label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-700">{label}</span>
                        <span className="text-sm text-gray-500">{value} · {pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-[width] duration-500 ease-in-out"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Fila 3: Entrevistas por mes + Últimas entrevistas */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-6">

          {/* Entrevistas por mes */}
          <div
            className="rounded-xl bg-white"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
          >
            <div className="p-6">
              <p className="text-base font-bold text-gray-800 mb-4">Entrevistas · últimos 6 meses</p>
              <BarChart
                data={ENTREVISTAS_POR_MES.map(e => ({ label: e.mes, value: e.valor }))}
                maxVal={maxEntrevista}
                color="#EEB35D"
              />
            </div>
          </div>

          {/* Últimas entrevistas */}
          <div
            className="rounded-xl bg-white"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
          >
            <div className="p-6">
              <p className="text-base font-bold text-gray-800 mb-4">Últimas entrevistas</p>
              <div className="flex flex-col">
                {ULTIMAS_ENTREVISTAS.map((e, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between py-3 gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{e.estudiante}</p>
                        <p className="text-xs text-gray-400">{e.tutor} · {e.fecha}</p>
                      </div>
                      <span
                        className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: e.estado === 'Completada' ? 'rgba(101,179,155,0.15)' : 'rgba(238,179,93,0.15)',
                          color:           e.estado === 'Completada' ? '#3d8a72'                 : '#a07020',
                        }}
                      >
                        {e.estado}
                      </span>
                    </div>
                    {i < ULTIMAS_ENTREVISTAS.length - 1 && (
                      <hr className="border-t border-gray-100" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default EstadisticasPage;
