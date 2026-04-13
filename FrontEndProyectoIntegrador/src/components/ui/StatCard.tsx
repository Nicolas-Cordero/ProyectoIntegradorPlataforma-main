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
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={1.5}
          sx={{ width: '100%', textAlign: 'center' }}
        >
          {icon && (
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <Box
              component="img"
              src={icon}
              alt={label}
              sx={{
                width: { xs: 36, md: 42 },
                height: { xs: 36, md: 42 },
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
            </Box>
          )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              minWidth: 0,
              width: '100%',
            }}
          >
            <TypingText
              component="span"
              text={label}
              startDelayMs={typingStartDelayMs}
              charDelayMs={1}
              sx={{
                color: 'text.secondary',
                lineHeight: 1.2,
                fontSize: { xs: '0.75rem', md: '0.85rem' },
                flexShrink: 1,
              }}
            />
            <Typography 
              variant="h5" 
              component="span"
              fontWeight={800}
              sx={{ 
                color: accentColor || 'text.primary',
                lineHeight: 1,
                fontSize: { xs: '1.5rem', md: '1.8rem' },
                letterSpacing: '-0.03em',
                flexShrink: 0,
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
