import React from 'react';
import { TableRow, TableCell, TextField, Typography } from '@mui/material';

interface EditableTextareaProps {
  label: string;
  value: string;
  modoEdicion: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export const EditableTextarea: React.FC<EditableTextareaProps> = ({
  label,
  value,
  modoEdicion,
  onChange,
  placeholder,
  rows = 4,
}) => {
  const displayValue = value || 'Sin definir';

  return (
    <TableRow>
      <TableCell 
        sx={{ 
          fontWeight: 'bold', 
          bgcolor: 'error.light',
          color: 'error.contrastText',
          width: '30%',
          verticalAlign: 'top',
          pt: 2,
        }}
      >
        {label}
      </TableCell>
      <TableCell sx={{ bgcolor: 'background.paper' }}>
        {modoEdicion ? (
          <TextField
            fullWidth
            multiline
            rows={rows}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            variant="outlined"
            size="small"
          />
        ) : (
          <Typography 
            variant="body2" 
            color={value ? 'text.primary' : 'text.secondary'}
            sx={{ whiteSpace: 'pre-wrap' }}
          >
            {displayValue}
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );
};
