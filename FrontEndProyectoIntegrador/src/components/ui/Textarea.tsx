import React from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

interface TextareaProps extends Omit<TextFieldProps, 'size' | 'multiline' | 'rows' | 'onChange'> {
  etiqueta?: string;
  valor?: string;
  onChange?: (valor: string) => void;
  error?: boolean;
  ayuda?: string;
  requerido?: boolean;
  deshabilitado?: boolean;
  filas?: number;
  tamano?: 'small' | 'medium';
}

export const Textarea: React.FC<TextareaProps> = ({
  etiqueta,
  valor,
  onChange,
  error = false,
  ayuda,
  requerido = false,
  deshabilitado = false,
  filas = 4,
  tamano = 'small',
  ...props
}) => {
  const idCampo = props.id || `textarea-${etiqueta?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <TextField
      id={idCampo}
      label={etiqueta}
      value={valor ?? ''}
      onChange={(evento) => onChange?.(evento.target.value)}
      error={error}
      helperText={ayuda}
      required={requerido}
      disabled={deshabilitado}
      multiline
      rows={filas}
      size={tamano}
      fullWidth
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-input': {
          fontFamily: "'Assistant', 'Open Sans', sans-serif",
          fontSize: '0.95rem',
          resize: 'vertical',
        },
        ...props.sx,
      }}
      aria-describedby={ayuda ? `ayuda-${idCampo}` : undefined}
      {...props}
    />
  );
};
