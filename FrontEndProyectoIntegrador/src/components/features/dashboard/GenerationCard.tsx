/**
 * Tarjeta individual de generación
 * Muestra año, cantidad de estudiantes y estado
 */
import { Card, CardContent, Box, Typography } from '@mui/material';
import { School as SchoolIcon, Add as AddIcon } from '@mui/icons-material';
import { GradientButton } from '../../common/GradientButton';
import { TypingText } from '../../common/TypingText';

interface GenerationCardProps {
  año: number;
  estudiantes: number;
  activos: number;
  estado: 'activa' | 'finalizada';
  onClick: () => void;
  onAddEstudiante?: (año: number) => void;
  typingStartDelayMs?: number;
  cardIndex?: number;
}

export function GenerationCard({
  año,
  estudiantes,
  activos,
  estado,
  onClick,
  onAddEstudiante,
  typingStartDelayMs = 0,
  cardIndex = 0,
}: GenerationCardProps) {
  const handleAddEstudiante = () => {
    onAddEstudiante?.(año);
  };

  // Paleta de colores para los íconos (rotativa)
  const iconColors = [
    '#65B39B', // Verde principal
    '#C7654F', // Rojo/Coral
    '#ECB876', // Amarillo
    '#D3C483', // Café
    '#8FD4BB', // Verde claro
    '#E89080', // Rojo claro
  ];
  const iconColor = iconColors[cardIndex % iconColors.length];

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '1px solid',
        borderColor: 'grey.200',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header con icono */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <SchoolIcon sx={{ fontSize: 48, color: iconColor, flexShrink: 0 }} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <TypingText
              component="span"
              text={`Generación ${año}`}
              startDelayMs={typingStartDelayMs}
              charDelayMs={1}
              sx={{
                display: 'block',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: 'text.primary',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            />
            <Typography 
              variant="body2" 
              sx={{
                color: estado === 'activa' ? '#65B39B' : '#ECB876',
                fontWeight: 600,
                fontSize: '0.9rem',
                opacity: 1,
                textShadow: estado === 'activa' 
                  ? '0 1px 2px rgba(101, 179, 155, 0.15)' 
                  : '0 1px 2px rgba(236, 184, 118, 0.15)',
              }}
            >
              {estado === 'activa' ? 'Activa' : 'Finalizada'}
            </Typography>
          </Box>
        </Box>

        {/* Estadísticas */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              {estudiantes}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Estudiantes
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="#65B39B">
              {activos}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Activos
            </Typography>
          </Box>
        </Box>

        {/* Botón para agregar estudiante */}
        {onAddEstudiante && (
          <div onClick={(e) => { e.stopPropagation(); handleAddEstudiante(); }} style={{ marginTop: '1.5rem' }}>
            <GradientButton
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleAddEstudiante}
              solidColor={'#65B39B'}
              sx={{ minHeight: { xs: 48, md: 56 } }}
            >
              Agregar Estudiante
            </GradientButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
