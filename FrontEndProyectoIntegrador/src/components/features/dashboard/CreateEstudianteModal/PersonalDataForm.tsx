import React from 'react';
import { Box, TextField, Typography, MenuItem } from '@mui/material';

interface PersonalDataFormProps {
  formData: {
    nombre: string;
    rut: string;
    email: string;
    telefono: string;
    fecha_de_nacimiento: string;
    tipo_de_estudiante: 'media' | 'universitario';
  };
  onChange: (field: string, value: string) => void;
}

export const PersonalDataForm: React.FC<PersonalDataFormProps> = ({ formData, onChange }) => {
  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(field, e.target.value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        Información personal del estudiante
      </Typography>

      <TextField
        fullWidth
        label="Nombre Completo *"
        value={formData.nombre}
        onChange={handleChange('nombre')}
        placeholder="Ej: Juan Pérez González"
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <TextField
          fullWidth
          label="RUT *"
          value={formData.rut}
          onChange={handleChange('rut')}
          placeholder="Ej: 12.345.678-9"
        />

        <TextField
          fullWidth
          label="Email *"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          placeholder="ejemplo@correo.com"
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <TextField
          fullWidth
          label="Teléfono"
          value={formData.telefono}
          onChange={handleChange('telefono')}
          placeholder="+56912345678"
        />

        <TextField
          fullWidth
          label="Fecha de Nacimiento *"
          type="date"
          value={formData.fecha_de_nacimiento}
          onChange={handleChange('fecha_de_nacimiento')}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <TextField
        fullWidth
        select
        label="Tipo de Estudiante *"
        value={formData.tipo_de_estudiante}
        onChange={handleChange('tipo_de_estudiante')}
      >
        <MenuItem value="media">Enseñanza Media</MenuItem>
        <MenuItem value="universitario">Universitario</MenuItem>
      </TextField>
    </Box>
  );
};
