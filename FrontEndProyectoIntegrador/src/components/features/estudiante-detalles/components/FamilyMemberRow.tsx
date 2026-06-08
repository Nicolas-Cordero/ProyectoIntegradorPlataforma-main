import { TableRow, TableCell, TextField, Box, Typography } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

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
  showNameField?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
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
  onEdit,
  onDelete,
}: FamilyMemberRowProps) {
  return (
    <TableRow>
      {/* Primera columna: relación (prominente) y nombre (secundario) */}
      <TableCell sx={{ bgcolor: 'grey.100', width: '20%' }}>
        {modoEdicion ? (
          <Box>
            <TextField
              fullWidth
              size="small"
              value={label}
              disabled
              sx={{ mb: showNameField ? 1 : 0, '& input': { fontWeight: 700 } }}
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
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-800">
              {label}
            </span>
            {showNameField && (
              <span className="text-sm text-gray-500 mt-0.5">
                {nombreValue || 'Sin definir'}
              </span>
            )}
          </div>
        )}
      </TableCell>

      {/* Segunda columna: observaciones */}
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

      {/* Tercera columna: acciones (solo si se proveen callbacks) */}
      {(onEdit || onDelete) && (
        <TableCell align="center" sx={{ whiteSpace: 'nowrap', width: 80 }}>
          {onEdit && (
            <button
              onClick={onEdit}
              title="Editar"
              className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <EditIcon fontSize="small" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              title="Eliminar"
              className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
            >
              <DeleteIcon fontSize="small" />
            </button>
          )}
        </TableCell>
      )}
    </TableRow>
  );
}
