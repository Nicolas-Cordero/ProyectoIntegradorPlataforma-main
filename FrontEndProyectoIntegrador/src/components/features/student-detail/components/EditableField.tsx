
import { TableRow, TableCell, TextField, MenuItem, Typography } from '@mui/material';

export type FieldType = 'text' | 'email' | 'tel' | 'date' | 'select' | 'number';

interface EditableFieldProps {
  label: string;
  value: string | number;
  type?: FieldType;
  modoEdicion: boolean;
  onChange: (value: string) => void;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  maxLength?: number;
  inputMode?: 'numeric' | 'text' | 'tel' | 'email';
  readOnly?: boolean;
}

export function EditableField({
  label,
  value,
  type = 'text',
  modoEdicion,
  onChange,
  options,
  placeholder,
  maxLength,
  inputMode,
  readOnly = false,
}: EditableFieldProps) {
  const displayValue = value || 'Sin definir';

  const renderInput = () => {
    if (readOnly || !modoEdicion) {
      return (
        <Typography variant="body2" color={value ? 'text.primary' : 'text.secondary'}>
          {displayValue}
        </Typography>
      );
    }

    if (type === 'select' && options) {
      return (
        <TextField
          select
          fullWidth
          size="small"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          variant="outlined"
        >
          <MenuItem value="">
            <em>Seleccionar...</em>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    return (
      <TextField
        fullWidth
        size="small"
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        variant="outlined"
        inputProps={{
          maxLength,
          inputMode,
        }}
      />
    );
  };

  return (
    <TableRow>
      <TableCell 
        sx={{ 
          fontWeight: 'bold', 
          bgcolor: 'error.light',
          color: 'error.contrastText',
          width: '30%',
        }}
      >
        {label}
      </TableCell>
      <TableCell sx={{ bgcolor: 'background.paper' }}>
        {renderInput()}
      </TableCell>
    </TableRow>
  );
};
