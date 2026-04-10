import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  onConfirm: () => void | Promise<void>;
}

interface UseConfirmDialogReturn {
  showConfirm: (options: ConfirmDialogOptions) => void;
  ConfirmDialog: React.FC;
}

/**
 * Hook para diálogos de confirmación
 * @returns Función para mostrar diálogo y componente
 */
export function useConfirmDialog(): UseConfirmDialogReturn {
  const [dialogState, setDialogState] = useState<ConfirmDialogOptions | null>(null);
  const [loading, setLoading] = useState(false);

  const showConfirm = useCallback((options: ConfirmDialogOptions) => {
    setDialogState(options);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!dialogState) return;
    
    setLoading(true);
    try {
      await dialogState.onConfirm();
      setDialogState(null);
    } catch (error) {
      console.error('Error en confirmación:', error);
    } finally {
      setLoading(false);
    }
  }, [dialogState]);

  const handleCancel = useCallback(() => {
    setDialogState(null);
    setLoading(false);
  }, []);

  const ConfirmDialog: React.FC = () => (
    <Dialog 
      open={!!dialogState} 
      onClose={loading ? undefined : handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {dialogState?.title || 'Confirmar acción'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {dialogState?.message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleCancel}
          disabled={loading}
          color="inherit"
        >
          {dialogState?.cancelText || 'Cancelar'}
        </Button>
        <Button 
          onClick={handleConfirm}
          color={dialogState?.confirmColor || 'primary'}
          disabled={loading}
          variant="contained"
          autoFocus
        >
          {dialogState?.confirmText || 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { showConfirm, ConfirmDialog };
}
