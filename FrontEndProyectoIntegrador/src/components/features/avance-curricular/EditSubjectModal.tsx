import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface Ramo {
  codigo: string;
  nombre: string;
  creditos: number;
  prerequisitos: string[];
  estado: 'pendiente' | 'cursando' | 'aprobado' | 'reprobado';
  nota?: number;
  oportunidad?: number;
}

interface EditSubjectModalProps {
  open: boolean;
  onClose: () => void;
  ramo: Ramo | null;
  onSave: (ramoActualizado: Ramo) => void;
}

export const EditSubjectModal: React.FC<EditSubjectModalProps> = ({
  open,
  onClose,
  ramo,
  onSave
}) => {
  const [formData, setFormData] = useState<Ramo | null>(null);

  useEffect(() => {
    if (ramo) {
      setFormData({ ...ramo });
    }
  }, [ramo]);

  if (!formData) return null;

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado': return 'success';
      case 'cursando': return 'warning';
      case 'reprobado': return 'error';
      case 'pendiente': return 'default';
      default: return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '400px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <EditIcon color="primary" />
        Editar Materia
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Información básica (no editable) */}
          <Box sx={{ 
            p: 2, 
            backgroundColor: '#f9f9f9', 
            borderRadius: 1,
            border: '1px solid #e0e0e0'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {formData.codigo}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              {formData.nombre}
            </Typography>
            <Chip 
              label={`${formData.creditos} créditos`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Estado */}
            <FormControl fullWidth>
              <InputLabel>Estado de la Materia</InputLabel>
              <Select
                value={formData.estado}
                onChange={(e) => setFormData({
                  ...formData,
                  estado: e.target.value as typeof formData.estado
                })}
                label="Estado de la Materia"
              >
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="cursando">Cursando</MenuItem>
                <MenuItem value="aprobado">Aprobado</MenuItem>
                <MenuItem value="reprobado">Reprobado</MenuItem>
              </Select>
            </FormControl>

            {/* Nota (solo si está aprobado o reprobado) */}
            <TextField
              fullWidth
              type="number"
              label="Nota Final"
              value={formData.nota || ''}
              onChange={(e) => setFormData({
                ...formData,
                nota: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              inputProps={{ 
                min: 1.0, 
                max: 7.0, 
                step: 0.1 
              }}
              disabled={formData.estado === 'pendiente' || formData.estado === 'cursando'}
              helperText={
                formData.estado === 'pendiente' || formData.estado === 'cursando'
                  ? 'Solo disponible para materias aprobadas o reprobadas'
                  : 'Escala de 1.0 a 7.0'
              }
            />

            {/* Oportunidad */}
            <TextField
              fullWidth
              type="number"
              label="Oportunidad"
              value={formData.oportunidad || 1}
              onChange={(e) => setFormData({
                ...formData,
                oportunidad: e.target.value ? parseInt(e.target.value) : 1
              })}
              inputProps={{ 
                min: 1, 
                max: 5, 
                step: 1 
              }}
              helperText="En qué oportunidad está cursando esta materia (1ra, 2da, 3ra...)"
            />
          </Box>

          {/* Estado actual preview */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              Vista previa:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip
                label={formData.estado.charAt(0).toUpperCase() + formData.estado.slice(1)}
                color={getEstadoColor(formData.estado) as 'success' | 'warning' | 'error' | 'default'}
                sx={{ textTransform: 'capitalize' }}
              />
              {formData.oportunidad && formData.oportunidad > 1 && (
                <Chip
                  label={`${formData.oportunidad}° Oportunidad`}
                  variant="outlined"
                  color="warning"
                  size="small"
                />
              )}
            </Box>
            {formData.nota && (
              <Typography 
                variant="h6" 
                sx={{ 
                  mt: 1,
                  fontWeight: 'bold',
                  color: formData.nota >= 4.0 ? '#4caf50' : '#f44336'
                }}
              >
                Nota: {formData.nota}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          color="inherit"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          color="primary"
          sx={{ ml: 2 }}
        >
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};