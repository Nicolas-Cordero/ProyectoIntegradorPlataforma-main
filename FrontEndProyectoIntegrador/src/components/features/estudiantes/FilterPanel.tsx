/**
 * Panel de filtros y búsqueda para el Dashboard
 * Permite buscar, filtrar y ordenar generaciones
 */
import { useState } from 'react';
import { Paper, Box, TextField, MenuItem, Button, Alert, Collapse } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { TypingText } from '../../common/TypingText';

interface FilterPanelProps {
  busqueda: string;
  filtroEstado: 'todas' | 'activas' | 'finalizadas';
  ordenarPor: 'año' | 'estudiantes';
  resultadosCount: number;
  onBusquedaChange: (value: string) => void;
  onFiltroEstadoChange: (value: 'todas' | 'activas' | 'finalizadas') => void;
  onOrdenarPorChange: (value: 'año' | 'estudiantes') => void;
  onLimpiarFiltros: () => void;
}

export function FilterPanel({
  busqueda,
  filtroEstado,
  ordenarPor,
  resultadosCount,
  onBusquedaChange,
  onFiltroEstadoChange,
  onOrdenarPorChange,
  onLimpiarFiltros,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 0,
        border: '1px solid',
        borderColor: 'grey.200',
        height: 'fit-content',
        maxHeight: open ? 'max-content' : '76px',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen((value) => !value);
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 3,
          py: 2.5,
          cursor: 'pointer',
          userSelect: 'none',
          backgroundColor: open ? 'grey.50' : 'transparent',
          borderBottom: open ? '1px solid' : 'none',
          borderBottomColor: open ? 'grey.200' : 'transparent',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'grey.50',
          },
        }}
      >
        <SearchIcon sx={{ color: '#65B39B' }} />
        <TypingText
          component="span"
          text="Filtros y Búsqueda"
          startDelayMs={26}
          charDelayMs={1}
          sx={{
            fontWeight: 'bold',
            color: 'text.primary',
          }}
        />
      </Box>

      <Collapse in={open} timeout="auto">
        <Box sx={{ px: 3, pb: 3, pt: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr' },
              gap: 2,
              alignItems: 'end'
            }}
          >
            {/* Búsqueda por año */}
            <TextField
              fullWidth
              label="Buscar por año"
              placeholder="Ej: 2024, 2023..."
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
              size="small"
              variant="outlined"
            />

            {/* Filtro por estado */}
            <TextField
              fullWidth
              select
              label="Estado"
              value={filtroEstado}
              onChange={(e) => onFiltroEstadoChange(e.target.value as any)}
              size="small"
              variant="outlined"
            >
              <MenuItem value="todas">Todas las generaciones</MenuItem>
              <MenuItem value="activas">Solo activas</MenuItem>
              <MenuItem value="finalizadas">Solo finalizadas</MenuItem>
            </TextField>

            {/* Ordenar por */}
            <TextField
              fullWidth
              select
              label="Ordenar por"
              value={ordenarPor}
              onChange={(e) => onOrdenarPorChange(e.target.value as any)}
              size="small"
              variant="outlined"
            >
              <MenuItem value="año">Año (más reciente)</MenuItem>
              <MenuItem value="estudiantes">Cantidad de estudiantes</MenuItem>
            </TextField>

            {/* Botón limpiar filtros */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={onLimpiarFiltros}
              sx={{
                textTransform: 'none',
                borderColor: 'grey.300',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'grey.400',
                  backgroundColor: 'grey.50'
                }
              }}
            >
              Limpiar filtros
            </Button>
          </Box>

          {/* Resultados de búsqueda */}
          <Alert
            severity="info"
            icon={false}
            sx={{ mt: 2, backgroundColor: 'grey.100', color: 'text.secondary' }}
          >
            <strong>{resultadosCount}</strong> generación(es) encontrada(s)
            {busqueda && (
              <span> • Búsqueda: "{busqueda}"</span>
            )}
            {filtroEstado !== 'todas' && (
              <span> • Estado: {filtroEstado}</span>
            )}
          </Alert>
        </Box>
      </Collapse>
    </Paper>
  );
}
