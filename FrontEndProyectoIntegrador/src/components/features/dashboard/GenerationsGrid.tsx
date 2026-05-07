/**
 * Grid de generaciones con mensaje de resultados vacíos
 * Muestra tarjetas de generaciones o mensaje cuando no hay resultados
 */

import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon, People as PeopleIcon } from '@mui/icons-material';
import { GenerationCard } from './GenerationCard';
import { GradientButton } from '../../common/GradientButton';

interface Generacion {
  año: number;
  estudiantes: number;
  activos: number;
  estado: 'activa' | 'finalizada';
}

interface GenerationsGridProps {
  generaciones: Generacion[];
  onAddEstudiante?: (año: number) => void;
  onCreateGeneracion?: () => void;
}

export function GenerationsGrid({
  generaciones,
  onAddEstudiante,
  onCreateGeneracion
}: GenerationsGridProps) {
  const navigate = useNavigate();

  // Mensaje cuando no hay resultados
  if (generaciones.length === 0) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 6,
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <SearchIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          No se encontraron generaciones
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={onCreateGeneracion}
        >
          Crear nueva generación
        </Button>
      </Paper>
    );
  }

  // Grid de generaciones
  return (
    <>
      <GradientButton
        className="gradient-subtle-hover"
        startIcon={<PeopleIcon />}
        onClick={onCreateGeneracion}
        fullWidth={false}
        solidColor='#65B39B'
        sx={{ mb: 2, minHeight: { xs: 40, sm: 48, md: 72 }, minWidth: { xs: 100, sm: 150, md: 280 }, fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' }, flexShrink: 0 }}>
        Crear Nueva Generación
      </GradientButton>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)'
        },
        gap: 3
      }}
    >
      {generaciones.map((generacion, index) => (
        <GenerationCard
          key={generacion.año}
          año={generacion.año}
          estudiantes={generacion.estudiantes}
          activos={generacion.activos}
          estado={generacion.estado}
          onClick={() => navigate(`/generacion/${generacion.año}`)}
          onAddEstudiante={onAddEstudiante}
          typingStartDelayMs={37 + index * 7}
          cardIndex={index}
        />
      ))}
    </Box>
    </>
  );
}
