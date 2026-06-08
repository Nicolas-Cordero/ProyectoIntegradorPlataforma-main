import React from 'react';
import { TextField, Box, FormHelperText } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

interface InputProps extends Omit<TextFieldProps, 'size' | 'onChange'> {
  etiqueta?: string;
  valor?: string | number;
  onChange?: (valor: string) => void;
  tipo?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';
  error?: boolean;
  ayuda?: string;
  requerido?: boolean;
  deshabilitado?: boolean;
  placeholder?: string;
  tamano?: 'small' | 'medium';
}

export const Input: React.FC<InputProps> = ({
  etiqueta,
  valor,
  onChange,
  tipo = 'text',
  error = false,
  ayuda,
  requerido = false,
  deshabilitado = false,
  placeholder,
  tamano = 'medium',
  ...props
}) => {
  const manejarCambio = (evento: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(evento.target.value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <TextField
        {...props}
        label={etiqueta}
        value={valor}
        onChange={manejarCambio}
        type={tipo}
        error={error}
        disabled={deshabilitado}
        placeholder={placeholder}
        size={tamano}
        required={requerido}
        variant="outlined"
        fullWidth
        aria-label={etiqueta}
        aria-describedby={ayuda ? `ayuda-${etiqueta}` : undefined}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5,
            backgroundColor: deshabilitado ? '#f5f5f5' : '#fff',
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#65B39B',
              borderWidth: '2px',
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: '#C7654F',
            },
          },
          '& .MuiInputBase-input': {
            fontFamily: "'Assistant', 'Open Sans', sans-serif",
            fontSize: '0.95rem',
          },
          '& .MuiInputLabel-root': {
            fontFamily: "'Assistant', 'Open Sans', sans-serif",
            fontWeight: 500,
          },
          ...props.sx,
        }}
      />
      {ayuda && (
        <FormHelperText
          id={`ayuda-${etiqueta}`}
          sx={{
            color: error ? '#C7654F' : '#666',
            fontSize: '0.8rem',
            ml: 0,
          }}
        >
          {ayuda}
        </FormHelperText>
      )}
    </Box>
  );
};
