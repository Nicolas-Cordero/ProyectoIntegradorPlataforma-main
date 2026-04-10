/**
 * Componente reutilizable para filas de información familiar
 * Muestra label, nombre y observaciones con modo edición
 */
import { TableRow, TableCell, TextField, Typography, Box } from '@mui/material';

interface FamilyMemberRowProps {
  label: string;
  nombreValue: string;
  observacionesValue: string;
  modoEdicion: boolean;
  nombrePlaceholder?: string;
  observacionesPlaceholder?: string;
  observacionesRows?: number;
  onNombreChange?: (value: string) => void;
  onObservacionesChange?: (value: string) => void;
  showNameField?: boolean; // Si false, solo muestra el label sin campo de nombre
}

export function FamilyMemberRow({
  label,
  nombreValue,
  observacionesValue,
  modoEdicion,
  nombrePlaceholder = '',
  observacionesPlaceholder = '',
  observacionesRows = 3,
  onNombreChange,
  onObservacionesChange,
  showNameField = true,
}: FamilyMemberRowProps) {
  return (
    <TableRow>
      {/* Primera columna: Label y nombre */}
      <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100', width: '20%' }}>
        {modoEdicion ? (
          <Box>
            <TextField 
              fullWidth 
              size="small" 
              value={label} 
              disabled 
              sx={{ mb: showNameField ? 1 : 0, fontWeight: 700 }}
            />
            {showNameField && (
              <TextField 
                fullWidth 
                size="small" 
                defaultValue={nombreValue || ''} 
                placeholder={nombrePlaceholder}
                variant="outlined"
                onChange={(e) => onNombreChange?.(e.target.value)}
              />
            )}
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" fontWeight={700} gutterBottom={showNameField}>
              {label}
            </Typography>
            {showNameField && (
              <Typography variant="body2" color="text.secondary">
                {nombreValue || 'Sin definir'}
              </Typography>
            )}
          </Box>
        )}
      </TableCell>

      {/* Segunda columna: Observaciones */}
      <TableCell>
        {modoEdicion ? (
          <TextField 
            fullWidth
            multiline
            rows={observacionesRows}
            size="small"
            defaultValue={observacionesValue || ''}
            placeholder={observacionesPlaceholder}
            variant="outlined"
            onChange={(e) => onObservacionesChange?.(e.target.value)}
          />
        ) : (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {observacionesValue || 'Sin observaciones'}
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );
}
