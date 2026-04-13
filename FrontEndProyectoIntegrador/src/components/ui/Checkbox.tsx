import React from 'react';
import {
  Checkbox as MuiCheckbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import type { CheckboxProps as MuiCheckboxProps, FormGroupProps } from '@mui/material';

interface CheckboxProps extends Omit<MuiCheckboxProps, 'size' | 'onChange'> {
  etiqueta?: string;
  marcado?: boolean;
  onChange?: (marcado: boolean) => void;
  deshabilitado?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  etiqueta = '',
  marcado = false,
  onChange,
  deshabilitado = false,
  ...props
}) => (
  <FormControlLabel
    control={
      <MuiCheckbox
        checked={marcado}
        onChange={(evento) => onChange?.(evento.target.checked)}
        disabled={deshabilitado}
        {...props}
      />
    }
    label={etiqueta}
  />
);

interface CheckboxGroupProps extends Omit<FormGroupProps, 'children' | 'onChange'> {
  opciones: Array<{ valor: string | number; etiqueta: string }>;
  valores: (string | number)[];
  onChange?: (valores: (string | number)[]) => void;
  deshabilitado?: boolean;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  opciones,
  valores,
  onChange,
  deshabilitado = false,
  ...props
}) => {
  const manejarCambio = (valor: string | number, marcado: boolean) => {
    const nuevosValores = marcado
      ? [...valores, valor]
      : valores.filter((v) => v !== valor);
    onChange?.(nuevosValores);
  };

  return (
    <FormGroup {...props}>
      {opciones.map((opcion) => (
        <FormControlLabel
          key={opcion.valor}
          control={
            <MuiCheckbox
              checked={valores.includes(opcion.valor)}
              onChange={(evento) => manejarCambio(opcion.valor, evento.target.checked)}
              disabled={deshabilitado}
            />
          }
          label={opcion.etiqueta}
        />
      ))}
    </FormGroup>
  );
};
