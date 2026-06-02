import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, ToggleButtonGroup, ToggleButton, Container } from '@mui/material';
import { School as SchoolIcon, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { estudianteService } from '../services';
import { logger } from '../config';
import { Spinner, ErrorMessage } from '../components/ui';
import { GradientButton } from '../components/common/GradientButton';

const ICON_COLORS = ['#65B39B', '#C7654F', '#ECB876', '#D3C483', '#8FD4BB', '#E89080'];

export const GeneracionesPanel: React.FC = () => {
  const navigate = useNavigate();

  const [generaciones, setGeneraciones] = useState<string[]>([]);
  const [orden, setOrden] = useState<'desc' | 'asc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await estudianteService.getGenerations();
      setGeneraciones(data);
    } catch (err) {
      logger.error('Error al cargar generaciones:', err);
      setError('No se pudo cargar la información de generaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generacionesOrdenadas = [...generaciones].sort((a, b) =>
    orden === 'desc' ? parseInt(b) - parseInt(a) : parseInt(a) - parseInt(b)
  );

  if (loading) return <Spinner fullScreen message="Cargando generaciones..." />;
  if (error) return <ErrorMessage fullScreen message={error} onRetry={fetchData} />;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFFBF0', py: 4 }}>
      <Container maxWidth="lg">

        {/* Header con gradiente */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #65B39B 0%, #4a9e87 40%, #C7654F 100%)',
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            mb: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(101, 179, 155, 0.35)',
          }}
        >
          {/* Círculos decorativos */}
          <Box sx={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <Box sx={{ position: 'absolute', bottom: -50, right: 80, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <Box sx={{ position: 'absolute', top: 20, right: 120, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, position: 'relative' }}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: 3,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }}
            >
              <SchoolIcon sx={{ fontSize: 40 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                Generaciones
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.85, mt: 0.5 }}>
                {generacionesOrdenadas.length} generación{generacionesOrdenadas.length !== 1 ? 'es' : ''} registrada{generacionesOrdenadas.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Controles de orden */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 1 }}>
          <CardContent sx={{ py: 2, px: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Ordenar por año:
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={orden}
              exclusive
              onChange={(_, value) => { if (value) setOrden(value); }}
            >
              <ToggleButton value="desc">
                <ArrowDownward fontSize="small" sx={{ mr: 0.5 }} /> Mayor a menor
              </ToggleButton>
              <ToggleButton value="asc">
                <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} /> Menor a mayor
              </ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>

        {/* Grid de tarjetas */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3,
          }}
        >
          {generacionesOrdenadas.map((gen, index) => {
            const color = ICON_COLORS[index % ICON_COLORS.length];
            return (
              <Card
                key={gen}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  transition: 'all 0.25s ease',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 },
                }}
              >
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Banda de color superior */}
                  <Box
                    sx={{
                      height: 6,
                      borderRadius: 2,
                      background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                      mx: -0.5,
                      mt: -0.5,
                    }}
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        bgcolor: `${color}18`,
                        borderRadius: 2.5,
                        p: 1.2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 32, color }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        GENERACIÓN
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" sx={{ lineHeight: 1.1 }}>
                        {gen}
                      </Typography>
                    </Box>
                  </Box>

                  <GradientButton
                    fullWidth
                    solidColor={color}
                    sx={{ minHeight: 44, borderRadius: 2 }}
                    onClick={() => navigate(`/generacion/${gen}`)}
                  >
                    Ver Generación
                  </GradientButton>
                </CardContent>
              </Card>
            );
          })}
        </Box>

      </Container>
    </Box>
  );
};
