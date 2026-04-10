import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { TypingText } from '../common/TypingText';

interface StatCardProps {
  /** Ruta a la imagen del icono (ej: '/src/assets/icons/students.ico') */
  icon?: string;
  /** Título descriptivo de la estadística */
  label: string;
  /** Valor numérico o string de la estadística */
  value: string | number;
  /** Color de acento opcional para el número */
  accentColor?: string;
  /** Acción al hacer clic sobre la tarjeta */
  onClick?: () => void;
  /** Retraso para iniciar la animación del texto del label */
  typingStartDelayMs?: number;
}

/**
 * Tarjeta reutilizable para mostrar estadísticas
 * Migrado a MUI - Usada en Dashboard y otras vistas de resumen
 */
export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  accentColor,
  onClick,
  typingStartDelayMs = 0,
}) => {
  const isClickable = Boolean(onClick);

  return (
    <Card 
      elevation={2}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      tabIndex={isClickable ? 0 : undefined}
      sx={{ 
        height: '100%',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        '&:focus-visible': {
          outline: '2px solid rgba(101, 179, 155, 0.6)',
          outlineOffset: 2,
        }
      }}
      role={isClickable ? 'button' : 'region'}
      aria-label={`${label}: ${value}`}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box
          display="grid"
          gridTemplateColumns="auto minmax(0, 1fr) auto"
          alignItems="center"
          justifyContent="center"
          columnGap={2}
          sx={{ minHeight: 72, width: '100%' }}
        >
          {icon && (
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Box
              component="img"
              src={icon}
              alt={label}
              sx={{
                width: { xs: 42, md: 46 },
                height: { xs: 42, md: 46 },
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
            </Box>
          )}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 0,
              textAlign: 'center',
            }}
          >
            <TypingText
              component="span"
              text={`${label}:`}
              startDelayMs={typingStartDelayMs}
              charDelayMs={1}
              sx={{
                color: 'text.secondary',
                lineHeight: 1,
                fontSize: { xs: '0.95rem', md: '1rem' },
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 48,
            }}
          >
            <Typography 
              variant="h4" 
              component="span"
              fontWeight={800}
              sx={{ 
                color: accentColor || 'text.primary',
                lineHeight: 1,
                fontSize: { xs: '2.1rem', md: '2.7rem' },
                letterSpacing: '-0.03em',
                flexShrink: 0,
                textAlign: 'center',
              }}
            >
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
