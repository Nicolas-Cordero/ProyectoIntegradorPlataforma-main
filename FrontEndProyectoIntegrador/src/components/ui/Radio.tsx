import React from 'react';
import {
  Radio as MuiRadio,
  FormControlLabel,
  RadioGroup as MuiRadioGroup,
  FormControl,
  FormLabel,
} from '@mui/material';
import type { RadioProps as MuiRadioProps, RadioGroupProps as MuiRadioGroupProps } from '@mui/material';

interface RadioProps extends Omit<MuiRadioProps, 'size' | 'onChange'> {
  etiqueta?: string;
  seleccionado?: boolean;
  onChange?: (seleccionado: boolean) => void;
  deshabilitado?: boolean;
}

export const Radio: React.FC<RadioProps> = ({
  etiqueta = '',
  seleccionado = false,
  onChange,
  deshabilitado = false,
  ...props
}) => (
  <FormControlLabel
    control={
      <MuiRadio
        checked={seleccionado}
        onChange={(evento) => onChange?.(evento.target.checked)}
        disabled={deshabilitado}
        {...props}
      />
    }
    label={etiqueta}
  />
);

interface RadioGroupProps extends Omit<MuiRadioGroupProps, 'children' | 'onChange'> {
  etiquetaGrupo?: string;
  opciones: Array<{ valor: string | number; etiqueta: string }>;
  valor?: string | number;
  onChange?: (valor: string | number) => void;
  orientacion?: 'row' | 'column';
  deshabilitado?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  etiquetaGrupo,
  opciones,
  valor,
  onChange,
  orientacion = 'row',
  deshabilitado = false,
  ...props
}) => {
  return (
    <FormControl disabled={deshabilitado}>
      {etiquetaGrupo && (
        <FormLabel sx={{ mb: 1 }}>{etiquetaGrupo}</FormLabel>
      )}
      <MuiRadioGroup
        row={orientacion === 'row'}
        value={valor ?? ''}
        onChange={(evento) => onChange?.(evento.target.value as string | number)}
        {...props}
      >
        {opciones.map((opcion) => (
          <FormControlLabel
            key={opcion.valor}
            value={opcion.valor}
            control={<MuiRadio />}
            label={opcion.etiqueta}
          />
        ))}
      </MuiRadioGroup>
    </FormControl>
  );
};
