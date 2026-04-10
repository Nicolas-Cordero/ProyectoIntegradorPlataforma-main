import React, { useState, useEffect } from 'react';
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface Ramo {
  id?: number;
  codigo: string;
  nombre: string;
  creditos: number;
  prerequisitos: string[];
  estado: 'pendiente' | 'cursando' | 'aprobado' | 'reprobado';
  nota?: number;
}

interface Semester {
  semestre: number;
  fechaInicio?: string;
  fechaFin?: string;
  periodo?: string;
  ramos: Ramo[];
}

interface SemesterModalProps {
  open: boolean;
  onClose: () => void;
  semester: Semester | null;
  onSave: (updatedSemester: Semester) => void;
  onDelete?: (semesterNumber: number) => void;
}

export const SemesterModal: React.FC<SemesterModalProps> = ({
  open,
  onClose,
  semester,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    semestre: 1,
    fechaInicio: '',
    fechaFin: '',
    periodo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (semester) {
      setFormData({
        semestre: semester.semestre,
        fechaInicio: semester.fechaInicio || '',
        fechaFin: semester.fechaFin || '',
        periodo: semester.periodo || '',
      });
    }
  }, [semester]);

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
    
    if (semester) {
      const updatedSemester: Semester = {
        ...semester,
        ...formData
      };
      onSave(updatedSemester);
    }
    onClose();
  };

  const handleDelete = () => {
    if (semester && onDelete && window.confirm(`¿Estás seguro de que quieres eliminar el Semestre ${semester.semestre}? Esto eliminará todas las materias asociadas.`)) {
      onDelete(semester.semestre);
      onClose();
    }
  };

  const generatePeriodoSuggestions = () => {
    const currentYear = new Date().getFullYear();
    const suggestions = [];
    for (let year = currentYear - 1; year <= currentYear + 2; year++) {
      suggestions.push(`${year}-1`, `${year}-2`);
    }
    return suggestions;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EditIcon />
        Configurar Semestre {semester?.semestre}
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

          {/* INFORMACIÓN DEL SEMESTRE */}
          {semester && (
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                📚 Materias en este semestre: {semester.ramos.length}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          {/* Botón de eliminar a la izquierda */}
          {onDelete && semester && (
            <Button
              onClick={handleDelete}
              color="error"
              startIcon={<DeleteIcon />}
              variant="outlined"
            >
              Eliminar Semestre
            </Button>
          )}
          
          {/* Botones principales a la derecha */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained"
              disabled={!semester}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};