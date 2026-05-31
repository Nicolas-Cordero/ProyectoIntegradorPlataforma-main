import { useState } from 'react';
import { Box } from '@mui/material';
import { Modal, Input, Button, Alert } from '../../ui';

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
    <Modal
      titulo="📅 Crear Nueva Generación"
      abierto={open}
      onCerrar={handleClose}
      tamanio="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && (
          <Alert 
            tipo="error" 
            mensaje={error}
            cerrable 
            onCerrar={() => setError('')}
          />
        )}

        <Input
          etiqueta="Año de la Generación"
          tipo="number"
          valor={año}
          onChange={setAño}
          placeholder="Ej: 2024"
          ayuda="Ingresa el año de ingreso de la generación"
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
          <Button variante="outline" tamano="md" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variante="primary" tamano="md" onClick={handleSubmit}>
            Crear Generación
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
