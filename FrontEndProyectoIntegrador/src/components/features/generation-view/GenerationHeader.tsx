import { Box, Breadcrumbs, Link, Typography, Button, Paper } from '@mui/material';
import { NavigateNext as NavigateNextIcon, Add as AddIcon, Folder as FolderIcon, People as PeopleIcon } from '@mui/icons-material';

interface GenerationHeaderProps {
  generationYear: number;
  totalStudents: number;
  onBack: () => void;
  onAddStudent: () => void;
}

/**
 * Header component for generation view
 * Shows generation year, total students, and action buttons
 */
export function GenerationHeader({
  generationYear,
  totalStudents,
  onBack,
  onAddStudent,
}: GenerationHeaderProps) {
  return (
    <Box sx={{ mb: 4 }}>
      {/* Breadcrumb / Navigation */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Link
          component="button"
          onClick={onBack}
          underline="hover"
          color="text.secondary"
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
            '&:hover': {
              color: '#EEB35D'
            }
          }}
        >
          Dashboard
        </Link>
        <Typography color="text.primary" fontWeight={500}>
          Generación {generationYear}
        </Typography>
      </Breadcrumbs>

      {/* Header con estilo de carpeta */}
      <Paper
        elevation={3}
        sx={{
          background: 'linear-gradient(135deg, #f9b150 0%, #EEB35D 50%, #e8a541 100%)',
          color: 'white',
          p: 3,
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Icono de carpeta */}
            <FolderIcon sx={{ fontSize: 64 }} />
            <Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 0.5 }}>
                Generación {generationYear}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon />
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  {totalStudents} estudiante{totalStudents !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Botón de acción destacado */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddStudent}
            sx={{
              backgroundColor: '#FFFEF5',
              color: '#EEB35D',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                transform: 'translateY(-2px)',
                boxShadow: 4,
                color: '#d99f2f'
              }
            }}
          >
            Agregar Estudiante
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
