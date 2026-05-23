import React from 'react';
import { Box, Typography } from '@mui/material';
import { Input, Select } from '../../../ui';

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
  const handleChange = (field: string) => (valor: string | number) => {
    onChange(field, String(valor));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        Información personal del estudiante
      </Typography>

      <Input
        etiqueta="Nombre Completo"
        valor={formData.nombre}
        onChange={handleChange('nombre')}
        placeholder="Ej: Juan Pérez González"
        requerido
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Input
          etiqueta="RUT"
          valor={formData.rut}
          onChange={handleChange('rut')}
          placeholder="Ej: 12.345.678-9"
          requerido
        />

        <Input
          etiqueta="Email"
          tipo="email"
          valor={formData.email}
          onChange={handleChange('email')}
          placeholder="ejemplo@correo.com"
          requerido
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Input
          etiqueta="Teléfono"
          tipo="tel"
          valor={formData.telefono}
          onChange={handleChange('telefono')}
          placeholder="+56912345678"
        />

        <Input
          etiqueta="Fecha de Nacimiento"
          tipo="text"
          valor={formData.fecha_de_nacimiento}
          onChange={handleChange('fecha_de_nacimiento')}
          placeholder="YYYY-MM-DD"
          requerido
        />
      </Box>

      <Select
        etiqueta="Tipo de Estudiante"
        opciones={[
          { valor: 'media', etiqueta: 'Enseñanza Media' },
          { valor: 'universitario', etiqueta: 'Universitario' }
        ]}
        valor={formData.tipo_de_estudiante}
        onChange={handleChange('tipo_de_estudiante')}
        requerido
      />
    </Box>
  );
};
