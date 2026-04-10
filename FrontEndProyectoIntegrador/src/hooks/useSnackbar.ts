import { useState, useCallback, createElement } from 'react';
import type { JSX } from 'react';
import { Snackbar, Alert } from '@mui/material';

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

interface UseSnackbarReturn {
  showSnackbar: (message: string, severity?: SnackbarSeverity) => void;
  hideSnackbar: () => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  SnackbarComponent: () => JSX.Element;
}

/**
 * Hook para manejar notificaciones tipo snackbar
 * @returns Funciones y componente de snackbar
 */
export function useSnackbar(): UseSnackbarReturn {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const showSnackbar = useCallback((
    message: string, 
    severity: SnackbarSeverity = 'success'
  ) => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const SnackbarComponent = () =>
    createElement(Snackbar, {
      open: snackbar.open,
      autoHideDuration: 4000,
      onClose: hideSnackbar,
      anchorOrigin: { vertical: 'bottom' as const, horizontal: 'center' as const },
      children: createElement(Alert, {
        onClose: hideSnackbar,
        severity: snackbar.severity,
        variant: 'filled' as const,
        sx: { width: '100%' },
        children: snackbar.message,
      }),
    });

  return { 
    showSnackbar, 
    hideSnackbar, 
    SnackbarComponent,
    showSuccess: (msg: string) => showSnackbar(msg, 'success'),
    showError: (msg: string) => showSnackbar(msg, 'error'),
    showWarning: (msg: string) => showSnackbar(msg, 'warning'),
    showInfo: (msg: string) => showSnackbar(msg, 'info'),
  };
}
