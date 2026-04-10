import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider
} from '@mui/material';
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
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AddIcon />
        Crear Nuevo Semestre {nextSemesterNumber}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* 📅 INFORMACIÓN DEL PERÍODO */}
          <Box>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CalendarTodayIcon fontSize="small" />
              Período Académico
            </Typography>
            
            <TextField
              fullWidth
              label="Período (Ej: 2024-1, 2024-2)"
              value={formData.periodo}
              onChange={handleChange('periodo')}
              error={!!errors.periodo}
              helperText={errors.periodo || 'Formato sugerido: AÑO-SEMESTRE'}
              placeholder="2024-1"
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Fecha de inicio"
                type="date"
                value={formData.fechaInicio}
                onChange={handleChange('fechaInicio')}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Fecha de fin"
                type="date"
                value={formData.fechaFin}
                onChange={handleChange('fechaFin')}
                error={!!errors.fechaFin}
                helperText={errors.fechaFin}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
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
                  size="small"
                  variant="outlined"
                  onClick={() => setFormData(prev => ({ ...prev, periodo: suggestion }))}
                  sx={{ fontSize: '0.75rem' }}
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
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          startIcon={<AddIcon />}
        >
          Crear Semestre {nextSemesterNumber}
        </Button>
      </DialogActions>
    </Dialog>
  );
};