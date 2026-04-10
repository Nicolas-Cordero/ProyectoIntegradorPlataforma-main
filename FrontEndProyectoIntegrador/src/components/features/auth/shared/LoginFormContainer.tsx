import { type ReactNode } from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

interface LoginFormContainerProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  gradientColors?: {
    from: string;
    to: string;
  };
}

/**
 * Componente contenedor reutilizable para formularios de login
 * Proporciona el diseño base con gradiente, papel y encabezado
 */
export function LoginFormContainer ({
  children,
  title,
  subtitle,
  icon,
  gradientColors = { from: '#667eea', to: '#764ba2' }
}: LoginFormContainerProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${gradientColors.from} 0%, ${gradientColors.to} 100%)`,
        p: 2
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            animation: 'slideIn 0.6s ease-out',
            '@keyframes slideIn': {
              from: { opacity: 0, transform: 'translateY(-20px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {icon && <Box sx={{ mb: 2 }}>{icon}</Box>}
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight="bold" 
              color="text.primary" 
              gutterBottom
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Form Content */}
          {children}
        </Paper>
      </Container>
    </Box>
  );
};
