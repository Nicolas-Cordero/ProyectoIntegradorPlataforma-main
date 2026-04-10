import React from 'react';
import { Box, TextField, Typography, MenuItem } from '@mui/material';

interface InstitutionFormProps {
    formData: {
        nombre_institucion: string;
        tipo_institucion: string;
        nivel_educativo: string;
        carrera_especialidad: string;
        duracion: string;
        anio_de_ingreso: string;
        anio_de_egreso: string;
    };
    onChange: (field: string, value: string) => void;
}

const TIPOS_INSTITUCION = [
    { value: 'Universidad', label: 'Universidad' },
    { value: 'Instituto Profesional', label: 'Instituto Profesional' },
    { value: 'Centro de Formación Técnica', label: 'Centro de Formación Técnica' },
    { value: 'Liceo', label: 'Liceo' },
    { value: 'Colegio', label: 'Colegio' }
];

const NIVELES_EDUCATIVOS = [
    { value: 'Media', label: 'Enseñanza Media' },
    { value: 'Superior', label: 'Educación Superior' },
    { value: 'Técnico', label: 'Técnico' },
    { value: 'Profesional', label: 'Profesional' }
];

export const InstitutionForm: React.FC<InstitutionFormProps> = ({ formData, onChange }) => {
    const handleChange = (field: string) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        onChange(field, e.target.value);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Información de la institución educativa
            </Typography>

            <TextField
                fullWidth
                label="Nombre de la Institución *"
                value={formData.nombre_institucion}
                onChange={handleChange('nombre_institucion')}
                placeholder="Ej: Universidad de Chile"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                    fullWidth
                    select
                    label="Tipo de Institución *"
                    value={formData.tipo_institucion}
                    onChange={handleChange('tipo_institucion')}
                >
                    {TIPOS_INSTITUCION.map((tipo) => (
                        <MenuItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    fullWidth
                    select
                    label="Nivel Educativo *"
                    value={formData.nivel_educativo}
                    onChange={handleChange('nivel_educativo')}
                >
                    {NIVELES_EDUCATIVOS.map((nivel) => (
                        <MenuItem key={nivel.value} value={nivel.value}>
                            {nivel.label}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            <TextField
                fullWidth
                label="Carrera / Especialidad *"
                value={formData.carrera_especialidad}
                onChange={handleChange('carrera_especialidad')}
                placeholder="Ej: Ingeniería Civil, Administración, etc."
                helperText="Nombre de la carrera o especialidad que estudia"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <TextField
                    fullWidth
                    label="Duración *"
                    value={formData.duracion}
                    onChange={handleChange('duracion')}
                    placeholder="Ej: 5 años"
                    helperText="Duración total"
                />

                <TextField
                    fullWidth
                    label="Año de Ingreso *"
                    type="number"
                    value={formData.anio_de_ingreso}
                    onChange={handleChange('anio_de_ingreso')}
                    placeholder="2024"
                    inputProps={{ min: 2000, max: 2030 }}
                />

                <TextField
                    fullWidth
                    label="Año de Egreso *"
                    type="number"
                    value={formData.anio_de_egreso}
                    onChange={handleChange('anio_de_egreso')}
                    placeholder="2029"
                    inputProps={{ min: 2000, max: 2040 }}
                    helperText="Año estimado"
                />
            </Box>
        </Box>
    );
};
