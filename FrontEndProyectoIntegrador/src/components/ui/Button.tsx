import React from 'react';
import { Button as MuiButton, CircularProgress, Box } from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material';

type VariantBoton = 'primary' | 'secondary' | 'danger' | 'outline';
type TamanoBoton = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variante?: VariantBoton;
  tamano?: TamanoBoton;
  cargando?: boolean;
  deshabilitado?: boolean;
}

const mapaVariantes: Record<VariantBoton, { fondo: string; hover: string; color: string }> = {
  primary: {
    fondo: '#65B39B',
    hover: '#4A9B7D',
    color: '#fff'
  },
  secondary: {
    fondo: '#C7654F',
    hover: '#A04A38',
    color: '#fff'
  },
  danger: {
    fondo: '#E74C3C',
    hover: '#C0392B',
    color: '#fff'
  },
  outline: {
    fondo: 'transparent',
    hover: '#F0F0F0',
    color: '#65B39B'
  }
};

const mapaTamanos: Record<TamanoBoton, { padding: string; fontSize: string }> = {
  sm: {
    padding: '6px 12px',
    fontSize: '0.875rem'
  },
  md: {
    padding: '8px 16px',
    fontSize: '1rem'
  },
  lg: {
    padding: '12px 24px',
    fontSize: '1.125rem'
  }
};

export const Button: React.FC<ButtonProps> = ({
  variante = 'primary',
  tamano = 'md',
  cargando = false,
  deshabilitado = false,
  children,
  onClick,
  className,
  ...props
}) => {
  const estilos = mapaVariantes[variante];
  const tamanios = mapaTamanos[tamano];
  const estaDisponible = !cargando && !deshabilitado;

  return (
    <MuiButton
      {...props}
      disabled={deshabilitado || cargando}
      onClick={onClick}
      variant="contained"
      sx={{
        padding: tamanios.padding,
        fontSize: tamanios.fontSize,
        fontWeight: 600,
        borderRadius: 1.5,
        backgroundColor: estilos.fondo,
        color: estilos.color,
        border: variante === 'outline' ? `1px solid ${estilos.color}` : 'none',
        cursor: estaDisponible ? 'pointer' : 'not-allowed',
        opacity: deshabilitado ? 0.6 : 1,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        '&:hover': {
          backgroundColor: estaDisponible ? estilos.hover : estilos.fondo,
          boxShadow: estaDisponible ? '0 4px 8px rgba(101, 179, 155, 0.2)' : 'none',
        },
        '&:active': {
          transform: estaDisponible ? 'scale(0.98)' : 'scale(1)',
        },
        ...props.sx,
      }}
      className={className}
    >
      {cargando ? (
        <CircularProgress size={20} color="inherit" />
      ) : null}
      {cargando ? (
        <Box component="span" sx={{ ml: 1 }}>Cargando...</Box>
      ) : (
        children
      )}
    </MuiButton>
  );
};
