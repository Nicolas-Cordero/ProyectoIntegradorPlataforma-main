import { Box, TextField, MenuItem } from '@mui/material';

interface StudentFilterPanelProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCarrera: string;
  onCarreraChange: (value: string) => void;
  selectedEstado: string;
  onEstadoChange: (value: string) => void;
  carreras: string[];
  estados: string[];
}

/**
 * Filter panel component for students
 * Includes search by name/RUT and filters for career and status
 */
export function StudentFilterPanel({
  searchTerm,
  onSearchChange,
  selectedCarrera,
  onCarreraChange,
  selectedEstado,
  onEstadoChange,
  carreras,
  estados,
}: StudentFilterPanelProps) {
  return (
    <Box 
      sx={{ 
        backgroundColor: 'grey.100', 
        p: 2.5, 
        borderRadius: 2, 
        mb: 2.5,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 2
      }}
    >
      <TextField
        fullWidth
        label="Buscar estudiante"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Nombre, apellido o RUT..."
        size="small"
        variant="outlined"
        sx={{
          backgroundColor: '#FFFEF5',
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#65B39B'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#65B39B'
            }
          }
        }}
      />

      <TextField
        fullWidth
        select
        label="Carrera"
        value={selectedCarrera}
        onChange={(e) => onCarreraChange(e.target.value)}
        size="small"
        variant="outlined"
        sx={{
          backgroundColor: '#FFFEF5',
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#65B39B'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#65B39B'
            }
          }
        }}
      >
        <MenuItem value="">Todas las carreras</MenuItem>
        {carreras.map(carrera => (
          <MenuItem key={carrera} value={carrera}>{carrera}</MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        select
        label="Estado"
        value={selectedEstado}
        onChange={(e) => onEstadoChange(e.target.value)}
        size="small"
        variant="outlined"
        sx={{
          backgroundColor: '#FFFEF5',
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#65B39B'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#65B39B'
            }
          }
        }}
      >
        <MenuItem value="">Todos los estados</MenuItem>
        {estados.map(estado => (
          <MenuItem key={estado} value={estado}>{estado}</MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
