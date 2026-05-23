import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Divider
} from '@mui/material';
import { Modal, Input, Button } from '../../../components/ui';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useConfirmDialog } from '../../ui';

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
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

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
    if (!semester || !onDelete) return;

    showConfirm({
      title: 'Eliminar semestre',
      message: `¿Estás seguro de que quieres eliminar el Semestre ${semester.semestre}? Esto eliminará todas las materias asociadas.`,
      confirmText: 'Eliminar',
      confirmColor: 'error',
      onConfirm: async () => {
        onDelete(semester.semestre);
        onClose();
      }
    });
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
    <Modal 
      titulo={`Configurar Semestre ${semester?.semestre}`}
      abierto={open} 
      onCerrar={onClose} 
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

        {/* INFORMACIÓN DEL SEMESTRE */}
        {semester && (
          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              📚 Materias en este semestre: {semester.ramos.length}
            </Typography>
          </Box>
        )}

        {/* ACCIONES */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 2 }}>
          {/* Botón de eliminar a la izquierda */}
          {onDelete && semester && (
            <Button
              variante="outline"
              tamano="md"
              onClick={handleDelete}
              sx={{ color: '#ef4444', borderColor: '#ef4444', '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' } }}
            >
              <DeleteIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
              Eliminar Semestre
            </Button>
          )}
          
          {/* Botones principales a la derecha */}
          <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
            <Button 
              variante="outline"
              tamano="md"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              variante="primary"
              tamano="md"
              onClick={handleSave} 
              deshabilitado={!semester}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};