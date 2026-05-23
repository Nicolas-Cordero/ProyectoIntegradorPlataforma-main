import React, { useState } from 'react';
import {
  Typography,
  Box,
  Divider
} from '@mui/material';
import { Modal, Input, Button } from '../../../components/ui';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface CreateSemesterData {
  fechaInicio?: string;
  fechaFin?: string;
  periodo?: string;
}

interface CreateSemesterModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (newSemesterData: CreateSemesterData) => void;
  currentMaxSemester: number;
}

export const CreateSemesterModal: React.FC<CreateSemesterModalProps> = ({
  open,
  onClose,
  onSave,
  currentMaxSemester
}) => {
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaFin: '',
    periodo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.periodo.trim()) {
      newErrors.periodo = 'El período es obligatorio';
    }
    
    if (formData.fechaInicio && formData.fechaFin) {
      const inicio = new Date(formData.fechaInicio);
      const fin = new Date(formData.fechaFin);
      if (inicio >= fin) {
        newErrors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    onSave(formData);
    
    // Limpiar formulario
    setFormData({
      fechaInicio: '',
      fechaFin: '',
      periodo: '',
    });
    setErrors({});
    onClose();
  };

  const handleCancel = () => {
    // Limpiar formulario al cancelar
    setFormData({
      fechaInicio: '',
      fechaFin: '',
      periodo: '',
    });
    setErrors({});
    onClose();
  };

  const generatePeriodoSuggestions = () => {
    const currentYear = new Date().getFullYear();
    const suggestions = [];
    for (let year = currentYear - 1; year <= currentYear + 2; year++) {
      suggestions.push(`${year}-1`, `${year}-2`);
    }
    return suggestions;
  };

  const nextSemesterNumber = currentMaxSemester + 1;

  return (
    <Modal 
      titulo={`Crear Nuevo Semestre ${nextSemesterNumber}`}
      abierto={open} 
      onCerrar={handleCancel} 
      tamanio="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* 📅 INFORMACIÓN DEL PERÍODO */}
        <Box>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CalendarTodayIcon fontSize="small" />
            Período Académico
          </Typography>
          
          <Input
            etiqueta="Período (Ej: 2024-1, 2024-2)"
            valor={formData.periodo}
            onChange={(v) => setFormData(prev => ({ ...prev, periodo: v }))}
            error={!!errors.periodo}
            ayuda={errors.periodo || 'Formato sugerido: AÑO-SEMESTRE'}
            placeholder="2024-1"
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Input
              etiqueta="Fecha de inicio"
              tipo="text"
              valor={formData.fechaInicio}
              onChange={(v) => setFormData(prev => ({ ...prev, fechaInicio: v }))}
              placeholder="YYYY-MM-DD"
            />
            <Input
              etiqueta="Fecha de fin"
              tipo="text"
              valor={formData.fechaFin}
              onChange={(v) => setFormData(prev => ({ ...prev, fechaFin: v }))}
              error={!!errors.fechaFin}
              ayuda={errors.fechaFin}
              placeholder="YYYY-MM-DD"
            />
          </Box>
        </Box>

        {/* SUGERENCIAS RÁPIDAS */}
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Períodos sugeridos:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {generatePeriodoSuggestions().slice(0, 6).map(suggestion => (
              <Button
                key={suggestion}
                variante="outline"
                tamano="sm"
                onClick={() => setFormData(prev => ({ ...prev, periodo: suggestion }))}
              >
                {suggestion}
              </Button>
            ))}
          </Box>
        </Box>

        {/* INFORMACIÓN */}
        <Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">
            📝 El nuevo semestre se creará vacío, sin materias.
            <br />
            ➕ Podrás agregar materias después de crearlo.
          </Typography>
        </Box>

        {/* ACCIONES */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variante="outline"
            tamano="md"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button 
            variante="primary"
            tamano="md"
            onClick={handleSave}
          >
            <AddIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
            Crear Semestre {nextSemesterNumber}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};