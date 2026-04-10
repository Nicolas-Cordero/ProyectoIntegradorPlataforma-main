/**
 * Navegación por pestañas del detalle de estudiante
 */
import { Tabs, Tab, Box } from '@mui/material';

export type SeccionActiva = 'perfil' | 'personal' | 'familiar' | 'informe' | 'desempeno' | 'entrevistas' | 'avance';

interface TabNavigationProps {
  seccionActiva: SeccionActiva;
  onSeccionChange: (seccion: SeccionActiva) => void;
  canViewInterviews?: boolean;
}

const tabs = [
  { id: 'perfil' as SeccionActiva, label: 'Perfil' },
  { id: 'personal' as SeccionActiva, label: 'Datos Personales' },
  { id: 'familiar' as SeccionActiva, label: 'Información Familiar' },
  { id: 'informe' as SeccionActiva, label: 'Informe Académico General' },
  { id: 'desempeno' as SeccionActiva, label: 'Desempeño por Semestre' },
  { id: 'avance' as SeccionActiva, label: 'Avance Curricular' },
  { id: 'entrevistas' as SeccionActiva, label: 'Entrevistas' },
];

export function TabNavigation({ 
  seccionActiva, 
  onSeccionChange,
  canViewInterviews = true
}: TabNavigationProps) {
  // Filtrar tabs basado en permisos
  const visibleTabs = tabs.filter(tab => {
    if (tab.id === 'entrevistas') {
      return canViewInterviews;
    }
    return true;
  });

  const handleChange = (_event: React.SyntheticEvent, newValue: SeccionActiva) => {
    onSeccionChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#FFFEF5', px: 4 }}>
      <Tabs 
        value={seccionActiva} 
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            minHeight: 60
          },
          '& .Mui-selected': {
            color: '#65B39B',
            fontWeight: 600
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#65B39B',
            height: 3
          }
        }}
      >
        {visibleTabs.map((tab) => (
          <Tab 
            key={tab.id}
            label={tab.label}
            value={tab.id}
          />
        ))}
      </Tabs>
    </Box>
  );
}
