import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material/Chip';

interface BadgeProps {
  estado: string;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

/**
 * Badge reutilizable para mostrar el estado de un estudiante
 * Migrado a MUI desde EstadoBadge
 */
export const Badge: React.FC<BadgeProps> = ({ 
  estado, 
  size = 'medium',
  variant = 'filled'
}) => {
  // Obtener colores del estado
  // Mapear clases de Tailwind a colores MUI
  const getColor = (estado: string): ChipProps['color'] => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('activo') || estadoLower.includes('aprobado')) return 'success';
    if (estadoLower.includes('pendiente') || estadoLower.includes('proceso')) return 'warning';
    if (estadoLower.includes('rechazado') || estadoLower.includes('inactivo')) return 'error';
    if (estadoLower.includes('pausa') || estadoLower.includes('suspendido')) return 'default';
    return 'primary';
  };

  return (
    <Chip 
      label={estado}
      size={size}
      variant={variant}
      color={getColor(estado)}
      sx={{ 
        fontWeight: 600,
        borderRadius: 2,
      }}
      aria-label={`Estado: ${estado}`}
    />
  );
};

// Alias para compatibilidad con código existente
export const EstadoBadge = Badge;
