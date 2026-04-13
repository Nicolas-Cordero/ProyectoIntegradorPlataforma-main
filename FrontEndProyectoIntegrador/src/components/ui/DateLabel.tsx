import React from 'react';
import { Typography, Box } from '@mui/material';
import type { TypographyProps } from '@mui/material';
import { formatDateChilean, formatRelativeDate } from '../../utils/dateHelpers';

type ModoFecha = 'chileno' | 'relativo';

interface DateLabelProps extends Omit<TypographyProps, 'children'> {
  fecha?: string | null;
  modo?: ModoFecha;
  fallback?: string;
  icono?: boolean;
}

export const DateLabel: React.FC<DateLabelProps> = ({
  fecha,
  modo = 'chileno',
  fallback = 'Sin registro',
  icono = false,
  ...props
}) => {
  let textoFecha: string;

  if (!fecha) {
    textoFecha = fallback;
  } else {
    try {
      textoFecha = modo === 'chileno' 
        ? formatDateChilean(fecha)
        : formatRelativeDate(fecha);
    } catch {
      textoFecha = 'Fecha inválida';
    }
  }

  const colorTexto = !fecha ? '#999' : '#333';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
      {...props}
    >
      {icono && (
        <Typography
          component="span"
          sx={{
            fontSize: '1rem',
            lineHeight: 1,
          }}
        >
          📅
        </Typography>
      )}
      <Typography
        variant="body2"
        sx={{
          color: colorTexto,
          fontFamily: "'Assistant', 'Open Sans', sans-serif",
          fontWeight: 500,
          ...props.sx,
        }}
      >
        {textoFecha}
      </Typography>
    </Box>
  );
};
