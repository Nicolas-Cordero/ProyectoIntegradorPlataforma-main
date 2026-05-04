import { TableRow, TableCell, Typography } from '@mui/material';
import { Input, Select } from '../../../ui';

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
      const opciones = options.map(opt => ({
        valor: opt.value,
        etiqueta: opt.label
      }));
      return (
        <Select
          opciones={opciones}
          valor={String(value || '')}
          onChange={(v) => onChange(String(v))}
          tamano="small"
        />
      );
    }

    // Mapear date a text para Input
    const inputType = type === 'date' ? 'text' : type;

    return (
      <Input
        tipo={inputType as 'text' | 'email' | 'number' | 'tel' | 'url' | 'password'}
        valor={String(value || '')}
        onChange={onChange}
        placeholder={placeholder}
      />
    );
  };

  return (
    <TableRow>
      <TableCell 
        sx={{ 
          fontWeight: 'bold', 
          bgcolor: 'grey.100',
          color: 'text.primary',
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
