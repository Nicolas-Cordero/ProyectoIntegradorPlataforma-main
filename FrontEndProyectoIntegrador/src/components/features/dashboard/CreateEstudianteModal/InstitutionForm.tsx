import React from 'react';
import { Box, Typography } from '@mui/material';
import { Input, Select } from '../../../ui';

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
    { valor: 'Universidad', etiqueta: 'Universidad' },
    { valor: 'Instituto Profesional', etiqueta: 'Instituto Profesional' },
    { valor: 'Centro de Formación Técnica', etiqueta: 'Centro de Formación Técnica' },
    { valor: 'Liceo', etiqueta: 'Liceo' },
    { valor: 'Colegio', etiqueta: 'Colegio' }
];

const NIVELES_EDUCATIVOS = [
    { valor: 'Media', etiqueta: 'Enseñanza Media' },
    { valor: 'Superior', etiqueta: 'Educación Superior' },
    { valor: 'Técnico', etiqueta: 'Técnico' },
    { valor: 'Profesional', etiqueta: 'Profesional' }
];

export const InstitutionForm: React.FC<InstitutionFormProps> = ({ formData, onChange }) => {
    const handleChange = (field: string) => (valor: string | number) => {
        onChange(field, String(valor));
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Información de la institución educativa
            </Typography>

            <Input
                etiqueta="Nombre de la Institución"
                valor={formData.nombre_institucion}
                onChange={handleChange('nombre_institucion')}
                placeholder="Ej: Universidad de Chile"
                requerido
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Select
                    etiqueta="Tipo de Institución"
                    opciones={TIPOS_INSTITUCION}
                    valor={formData.tipo_institucion}
                    onChange={handleChange('tipo_institucion')}
                    requerido
                />

                <Select
                    etiqueta="Nivel Educativo"
                    opciones={NIVELES_EDUCATIVOS}
                    valor={formData.nivel_educativo}
                    onChange={handleChange('nivel_educativo')}
                    requerido
                />
            </Box>

            <Input
                etiqueta="Carrera / Especialidad"
                valor={formData.carrera_especialidad}
                onChange={handleChange('carrera_especialidad')}
                placeholder="Ej: Ingeniería Civil, Administración, etc."
                ayuda="Nombre de la carrera o especialidad que estudia"
                requerido
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Input
                    etiqueta="Duración"
                    valor={formData.duracion}
                    onChange={handleChange('duracion')}
                    placeholder="Ej: 5 años"
                    ayuda="Duración total"
                    requerido
                />

                <Input
                    etiqueta="Año de Ingreso"
                    tipo="number"
                    valor={formData.anio_de_ingreso}
                    onChange={handleChange('anio_de_ingreso')}
                    placeholder="2024"
                    requerido
                />

                <Input
                    etiqueta="Año de Egreso"
                    tipo="number"
                    valor={formData.anio_de_egreso}
                    onChange={handleChange('anio_de_egreso')}
                    placeholder="2029"
                    ayuda="Año estimado"
                    requerido
                />
            </Box>
        </Box>
    );
};
