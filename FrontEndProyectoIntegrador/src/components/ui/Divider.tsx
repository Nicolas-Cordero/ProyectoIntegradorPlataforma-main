import React from 'react';
import { Divider as MuiDivider, Box } from '@mui/material';
import type { DividerProps as MuiDividerProps } from '@mui/material';

interface DividerProps extends MuiDividerProps {
  texto?: string;
  distancia?: 'sm' | 'md' | 'lg';
  color?: 'primario' | 'secundario' | 'gris';
  orientacion?: 'horizontal' | 'vertical';
}

const mapaDistancias: Record<string, { my: number }> = {
  sm: { my: 1 },
  md: { my: 2 },
  lg: { my: 3 },
};

const mapaColores: Record<string, string> = {
  primario: '#65B39B',
  secundario: '#C7654F',
  gris: '#e0e0e0',
};

export const Divider: React.FC<DividerProps> = ({
  texto,
  distancia = 'md',
  color = 'gris',
  orientacion = 'horizontal',
  ...props
}) => {
  if (orientacion === 'vertical') {
    return (
      <MuiDivider
        {...props}
        orientation="vertical"
        sx={{
          borderColor: mapaColores[color],
          ...mapaDistancias[distancia],
          ...props.sx,
        }}
      />
    );
  }

  if (texto) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', my: mapaDistancias[distancia].my }}>
        <MuiDivider
          sx={{
            flex: 1,
            borderColor: mapaColores[color],
          }}
        />
        <Box
          sx={{
            px: 1.5,
            fontFamily: "'Assistant', 'Open Sans', sans-serif",
            fontSize: '0.85rem',
            fontWeight: 500,
            color: mapaColores[color],
            whiteSpace: 'nowrap',
          }}
        >
          {texto}
        </Box>
        <MuiDivider
          sx={{
            flex: 1,
            borderColor: mapaColores[color],
          }}
        />
      </Box>
    );
  }

  return (
    <MuiDivider
      {...props}
      sx={{
        borderColor: mapaColores[color],
        ...mapaDistancias[distancia],
        ...props.sx,
      }}
    />
  );
};
