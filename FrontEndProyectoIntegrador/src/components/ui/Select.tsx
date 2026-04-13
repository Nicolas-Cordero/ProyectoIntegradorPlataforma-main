import React from 'react';
import { Select as MuiSelect, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';
import type { SelectProps as MuiSelectProps } from '@mui/material';

interface SelectProps extends Omit<MuiSelectProps, 'size' | 'onChange'> {
  etiqueta?: string;
  opciones: Array<{ valor: string | number; etiqueta: string }>;
  valor?: string | number;
  onChange?: (valor: string | number) => void;
  error?: boolean;
  ayuda?: string;
  requerido?: boolean;
  deshabilitado?: boolean;
  tamano?: 'small' | 'medium';
}

export const Select: React.FC<SelectProps> = ({
  etiqueta,
  opciones,
  valor,
  onChange,
  error = false,
  ayuda,
  requerido = false,
  deshabilitado = false,
  tamano = 'medium',
  ...props
}) => {
  const idFormulario = props.id || `select-${etiqueta?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <FormControl fullWidth error={error} disabled={deshabilitado}>
      {etiqueta && (
        <InputLabel id={idFormulario}>{etiqueta}</InputLabel>
      )}
      <MuiSelect
        labelId={idFormulario}
        id={idFormulario}
        value={valor ?? ''}
        label={etiqueta}
        size={tamano}
        onChange={(evento) => onChange?.(evento.target.value as string | number)}
        aria-describedby={ayuda ? `ayuda-${idFormulario}` : undefined}
        sx={{
          '& .MuiOutlinedInput-input': {
            fontFamily: "'Assistant', 'Open Sans', sans-serif",
            fontSize: '0.95rem',
          },
          ...props.sx,
        }}
      >
        {opciones.map((opcion) => (
          <MenuItem key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </MenuItem>
        ))}
      </MuiSelect>
      {ayuda && (
        <FormHelperText
          id={`ayuda-${idFormulario}`}
          sx={{
            color: error ? '#C7654F' : '#666',
            fontSize: '0.8rem',
            ml: 0,
          }}
        >
          {ayuda}
        </FormHelperText>
      )}
    </FormControl>
  );
};
