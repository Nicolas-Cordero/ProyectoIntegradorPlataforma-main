import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  Typography
} from '@mui/material';

interface CreateGeneracionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (year: number) => void;
}

export function CreateGeneracionModal({
  open,
  onClose,
  onSuccess
}: CreateGeneracionModalProps) {
  const [año, setAño] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');

    // Validar año
    const añoNum = parseInt(año);
    const currentYear = new Date().getFullYear();

    if (!año || isNaN(añoNum)) {
      setError('Por favor ingresa un año válido');
      return;
    }

    if (añoNum < 2000 || añoNum > currentYear + 5) {
      setError(`El año debe estar entre 2000 y ${currentYear + 5}`);
      return;
    }

    onSuccess(añoNum);
    handleClose();
  };

  const handleClose = () => {
    setAño('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          📅 Crear Nueva Generación
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Año de la Generación"
            type="number"
            value={año}
            onChange={(e) => setAño(e.target.value)}
            placeholder="Ej: 2024"
            helperText="Ingresa el año de ingreso de la generación"
            autoFocus
            inputProps={{
              min: 2000,
              max: new Date().getFullYear() + 5
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: 'var(--color-turquoise)',
            '&:hover': {
              bgcolor: 'var(--color-turquoise-dark)'
            }
          }}
        >
          Crear Generación
        </Button>
      </DialogActions>
    </Dialog>
  );
};
