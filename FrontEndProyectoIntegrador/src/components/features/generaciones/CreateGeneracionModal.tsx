import { useState } from 'react';
import { Box } from '@mui/material';
import { Modal, Input, Button, Alert } from '../../ui';
import { estudianteService } from '../../../services';
import type { Generacion } from '../../../types';

interface CreateGeneracionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (generacion: Generacion) => void;
}

export function CreateGeneracionModal({ open, onClose, onSuccess }: CreateGeneracionModalProps) {
  const [año, setAño] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    const añoNum = parseInt(año);
    const currentYear = new Date().getFullYear();

    if (!año || isNaN(añoNum)) {
      setError('Por favor ingresa un año válido');
      return;
    }

    if (añoNum < 1990 || añoNum > currentYear + 5) {
      setError(`El año debe estar entre 1990 y ${currentYear + 5}`);
      return;
    }

    setLoading(true);
    try {
      const nueva = await estudianteService.createGeneracion({
        año: añoNum,
        descripcion: descripcion.trim() || undefined,
      });
      onSuccess(nueva);
      handleClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear la generación. Intenta de nuevo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setAño('');
    setDescripcion('');
    setError('');
    onClose();
  };

  return (
    <Modal
      titulo="Crear Nueva Generación"
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
          etiqueta="Año de la Generación *"
          tipo="number"
          valor={año}
          onChange={setAño}
          placeholder="Ej: 2024"
          ayuda="Año de ingreso de la generación (obligatorio)"
          deshabilitado={loading}
        />

        <Input
          etiqueta="Descripción"
          tipo="text"
          valor={descripcion}
          onChange={setDescripcion}
          placeholder="Ej: Primera generación UCN"
          ayuda="Descripción opcional para identificar la generación"
          deshabilitado={loading}
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
          <Button variante="outline" tamano="md" onClick={handleClose} deshabilitado={loading}>
            Cancelar
          </Button>
          <Button variante="primary" tamano="md" onClick={handleSubmit} cargando={loading}>
            Crear Generación
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
