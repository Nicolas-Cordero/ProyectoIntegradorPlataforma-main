import React from 'react';
import { Alert as MuiAlert, AlertTitle } from '@mui/material';
import type { AlertProps as MuiAlertProps } from '@mui/material';

type TipoAlerta = 'exito' | 'error' | 'advertencia' | 'info';

interface AlertProps extends Omit<MuiAlertProps, 'severity' | 'variant'> {
  tipo?: TipoAlerta;
  titulo?: string;
  mensaje: string;
  variante?: 'filled' | 'outlined' | 'standard';
  icono?: boolean;
  cerrable?: boolean;
  onCerrar?: () => void;
}

const mapsaTipos: Record<TipoAlerta, MuiAlertProps['severity']> = {
  exito: 'success',
  error: 'error',
  advertencia: 'warning',
  info: 'info',
};

export const Alert: React.FC<AlertProps> = ({
  tipo = 'info',
  titulo,
  mensaje,
  variante = 'standard',
  icono = true,
  cerrable = false,
  onCerrar,
  ...props
}) => {
  const [visible, setVisible] = React.useState(true);

  const manejarCierre = () => {
    setVisible(false);
    onCerrar?.();
  };

  if (!visible) return null;

  const colorFondo = {
    exito: '#d4edda',
    error: '#f8d7da',
    advertencia: '#fff3cd',
    info: '#d1ecf1',
  };

  const colorBorde = {
    exito: '#c3e6cb',
    error: '#f5c6cb',
    advertencia: '#ffeeba',
    info: '#bee5eb',
  };

  return (
    <MuiAlert
      {...props}
      severity={mapsaTipos[tipo]}
      variant={variante}
      onClose={cerrable ? manejarCierre : undefined}
      icon={icono ? undefined : false}
      sx={{
        fontFamily: "'Assistant', 'Open Sans', sans-serif",
        fontSize: '0.95rem',
        borderRadius: 1.5,
        ...(variante === 'standard' && {
          backgroundColor: colorFondo[tipo],
          borderLeft: `4px solid ${colorBorde[tipo]}`,
          color: '#333',
        }),
        ...props.sx,
      }}
    >
      {titulo && <AlertTitle sx={{ fontWeight: 600 }}>{titulo}</AlertTitle>}
      {mensaje}
    </MuiAlert>
  );
};
