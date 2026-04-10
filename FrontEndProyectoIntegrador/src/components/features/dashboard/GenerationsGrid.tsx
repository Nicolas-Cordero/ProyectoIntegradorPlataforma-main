/**
 * Grid de generaciones con mensaje de resultados vacíos
 * Muestra tarjetas de generaciones o mensaje cuando no hay resultados
 */

import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { GenerationCard } from './GenerationCard';

interface Generacion {
  año: number;
  estudiantes: number;
  activos: number;
  estado: 'activa' | 'finalizada';
}

interface GenerationsGridProps {
  generaciones: Generacion[];
  onLimpiarFiltros: () => void;
  onAddEstudiante?: (año: number) => void;
}

export function GenerationsGrid({
  generaciones,
  onLimpiarFiltros,
  onAddEstudiante
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
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Intenta ajustar los filtros de búsqueda para encontrar lo que buscas.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ClearIcon />}
          onClick={onLimpiarFiltros}
          sx={{
            backgroundColor: '#65B39B',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: '#8FD4BB'
            }
          }}
        >
          Limpiar filtros
        </Button>
      </Paper>
    );
  }

  // Grid de generaciones
  return (
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
  );
}
