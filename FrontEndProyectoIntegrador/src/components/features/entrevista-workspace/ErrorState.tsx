import { Box, Typography, Button, Alert } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Error as ErrorIcon } from '@mui/icons-material';

interface ErrorStateProps {
  error: string;
  onBack: () => void;
}

/**
 * Error state component for workspace
 */
export function ErrorState({ error, onBack }: ErrorStateProps) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
      <Box sx={{ textAlign: 'center', maxWidth: 500, p: 4 }}>
        <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Error al cargar
        </Typography>
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {error}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          variant="contained"
          size="large"
        >
          Volver
        </Button>
      </Box>
    </Box>
  );
}
