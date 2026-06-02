import { Box, Card, CardContent, Typography, Container, Chip, Divider } from '@mui/material';
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
  { label: 'Estudiantes activos', value: 148, icon: PeopleIcon,    color: '#65B39B', bg: 'rgba(101,179,155,0.12)' },
  { label: 'Generaciones',        value: 6,   icon: SchoolIcon,    color: '#C7654F', bg: 'rgba(199,101,79,0.12)'  },
  { label: 'Entrevistas totales', value: 312, icon: EntrevistaIcon, color: '#EEB35D', bg: 'rgba(238,179,93,0.12)' },
  { label: 'Tutores activos',     value: 9,   icon: TutorIcon,     color: '#7B8FD4', bg: 'rgba(123,143,212,0.12)' },
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
  { label: 'Activo',      value: 92,  color: '#65B39B' },
  { label: 'Condicional', value: 21,  color: '#EEB35D' },
  { label: 'Egresado',    value: 18,  color: '#7B8FD4' },
  { label: 'Suspendido',  value: 9,   color: '#C7654F' },
  { label: 'Retirado',    value: 5,   color: '#9E9E9E' },
  { label: 'Titulado',    value: 3,   color: '#4CAF50' },
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
  { estudiante: 'María González', tutor: 'Carlos Pérez',  fecha: '01/06/2026', estado: 'Completada' },
  { estudiante: 'Juan Muñoz',     tutor: 'Ana Torres',    fecha: '31/05/2026', estado: 'Completada' },
  { estudiante: 'Sofía Reyes',    tutor: 'Carlos Pérez',  fecha: '30/05/2026', estado: 'Completada' },
  { estudiante: 'Diego Araya',    tutor: 'Luis Morales',  fecha: '29/05/2026', estado: 'Pendiente'  },
  { estudiante: 'Camila Vega',    tutor: 'Ana Torres',    fecha: '28/05/2026', estado: 'Completada' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const maxGeneracion = Math.max(...ESTUDIANTES_POR_GENERACION.map(g => g.total));
const maxEntrevista = Math.max(...ENTREVISTAS_POR_MES.map(e => e.valor));
const totalEstados  = ESTADOS.reduce((s, e) => s + e.value, 0);

// ── Componentes pequeños ──────────────────────────────────────────────────────

function BarChart({ data, maxVal, color }: { data: { label: string; value: number }[]; maxVal: number; color: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 140, pt: 1 }}>
      {data.map(({ label, value }) => (
        <Box key={label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#1f2937', fontWeight: 600 }}>{value}</Typography>
          <Box
            sx={{
              width: '100%',
              height: `${(value / maxVal) * 110}px`,
              background: `linear-gradient(180deg, ${color} 0%, ${color}99 100%)`,
              borderRadius: '6px 6px 0 0',
              transition: 'height 0.4s ease',
              minHeight: 4,
            }}
          />
          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>{label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function EstadisticasPage() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFFBF0', py: 4 }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #65B39B 0%, #4a9e87 40%, #C7654F 100%)',
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            mb: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(101,179,155,0.35)',
          }}
        >
          <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <Box sx={{ position: 'absolute', bottom: -60, left: -20, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <TrendingIcon sx={{ fontSize: 36 }} />
            <TypingText
              component="h1"
              text="Estadísticas"
              startDelayMs={0}
              charDelayMs={1}
              sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, fontWeight: 800, m: 0 }}
            />
          </Box>
          <Typography sx={{ opacity: 0.85, fontSize: '1rem' }}>
            Resumen general de la plataforma · datos de ejemplo
          </Typography>
        </Box>

        {/* KPI cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: 2, mb: 4 }}>
          {KPI_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon sx={{ color, fontSize: 24 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1f2937', lineHeight: 1 }}>{value}</Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>{label}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Fila 2: Estudiantes por generación + Estado */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>

          {/* Estudiantes por generación */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1f2937', mb: 2 }}>
                Estudiantes por generación
              </Typography>
              <BarChart
                data={ESTUDIANTES_POR_GENERACION.map(g => ({ label: String(g.año), value: g.total }))}
                maxVal={maxGeneracion}
                color="#65B39B"
              />
            </CardContent>
          </Card>

          {/* Distribución por estado */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1f2937', mb: 2 }}>
                Distribución por estado
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {ESTADOS.map(({ label, value, color }) => {
                  const pct = Math.round((value / totalEstados) * 100);
                  return (
                    <Box key={label}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: '#374151', fontWeight: 600 }}>{label}</Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>{value} · {pct}%</Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 8, bgcolor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Fila 3: Entrevistas por mes + Últimas entrevistas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.4fr' }, gap: 3 }}>

          {/* Entrevistas por mes */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1f2937', mb: 2 }}>
                Entrevistas · últimos 6 meses
              </Typography>
              <BarChart
                data={ENTREVISTAS_POR_MES.map(e => ({ label: e.mes, value: e.valor }))}
                maxVal={maxEntrevista}
                color="#EEB35D"
              />
            </CardContent>
          </Card>

          {/* Últimas entrevistas */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1f2937', mb: 2 }}>
                Últimas entrevistas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {ULTIMAS_ENTREVISTAS.map((e, i) => (
                  <Box key={i}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, gap: 1 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {e.estudiante}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                          {e.tutor} · {e.fecha}
                        </Typography>
                      </Box>
                      <Chip
                        label={e.estado}
                        size="small"
                        sx={{
                          flexShrink: 0,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          bgcolor: e.estado === 'Completada' ? 'rgba(101,179,155,0.15)' : 'rgba(238,179,93,0.15)',
                          color:   e.estado === 'Completada' ? '#3d8a72' : '#a07020',
                        }}
                      />
                    </Box>
                    {i < ULTIMAS_ENTREVISTAS.length - 1 && <Divider />}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

      </Container>
    </Box>
  );
}

export default EstadisticasPage;
