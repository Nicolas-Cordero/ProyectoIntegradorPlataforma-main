import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import type { PaperProps } from '@mui/material';

interface CardProps extends PaperProps {
  titulo?: string;
  children: React.ReactNode;
  elevacion?: number;
}

export const Card: React.FC<CardProps> = ({
  titulo,
  children,
  elevacion = 1,
  ...props
}) => {
  return (
    <Paper
      elevation={elevacion}
      {...props}
      sx={{
        borderRadius: 2,
        padding: 2.5,
        backgroundColor: '#FFFEF5',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        },
        ...props.sx,
      }}
    >
      {titulo && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#333',
              fontFamily: "'Assistant', 'Open Sans', sans-serif",
              fontSize: '1.1rem',
            }}
          >
            {titulo}
          </Typography>
        </Box>
      )}
      <Box>
        {children}
      </Box>
    </Paper>
  );
};
