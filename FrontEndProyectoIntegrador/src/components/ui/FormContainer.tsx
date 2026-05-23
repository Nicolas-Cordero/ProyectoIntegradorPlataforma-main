import React from 'react';
import { Box, Stack } from '@mui/material';
import type { StackProps } from '@mui/material';

interface FormContainerProps {
  titulo?: string;
  descripcion?: string;
  children: React.ReactNode;
  onSubmit?: (evento: React.FormEvent<HTMLFormElement>) => void;
  espaciado?: 'sm' | 'md' | 'lg';
  centrado?: boolean;
  sx?: StackProps['sx'];
  spacing?: StackProps['spacing'];
}

const mapaEspaciado: Record<string, number> = {
  sm: 1.5,
  md: 2.5,
  lg: 3.5,
};

export const FormContainer: React.FC<FormContainerProps> = ({
  titulo,
  descripcion,
  children,
  onSubmit,
  espaciado = 'md',
  centrado = false,
  sx,
  spacing,
}) => {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        width: '100%',
        maxWidth: centrado ? '600px' : '100%',
        mx: centrado ? 'auto' : 0,
      }}
    >
      {titulo && (
        <Box sx={{ mb: mapaEspaciado[espaciado] }}>
          <h2
            style={{
              fontFamily: "'Assistant', 'Open Sans', sans-serif",
              fontWeight: 700,
              fontSize: '1.5rem',
              color: '#333',
              margin: 0,
              marginBottom: descripcion ? '0.5rem' : 0,
            }}
          >
            {titulo}
          </h2>
          {descripcion && (
            <p
              style={{
                fontFamily: "'Assistant', 'Open Sans', sans-serif",
                fontSize: '0.95rem',
                color: '#666',
                margin: 0,
              }}
            >
              {descripcion}
            </p>
          )}
        </Box>
      )}
      <Stack
        spacing={spacing ?? mapaEspaciado[espaciado]}
        sx={sx}
      >
        {children}
      </Stack>
    </Box>
  );
};
