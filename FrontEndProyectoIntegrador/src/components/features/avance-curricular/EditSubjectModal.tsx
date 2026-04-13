import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Chip
} from '@mui/material';
import { Modal, Input, Select, Button } from '../../../components/ui';
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
    <Modal 
      titulo="Editar Materia"
      abierto={open} 
      onCerrar={onClose}
      tamanio="sm"
    >
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

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          {/* Estado */}
          <Select
            etiqueta="Estado de la Materia"
            opciones={[
              { valor: 'pendiente', etiqueta: 'Pendiente' },
              { valor: 'cursando', etiqueta: 'Cursando' },
              { valor: 'aprobado', etiqueta: 'Aprobado' },
              { valor: 'reprobado', etiqueta: 'Reprobado' }
            ]}
            valor={formData.estado}
            onChange={(v) => setFormData({
              ...formData,
              estado: v as typeof formData.estado
            })}
          />

          {/* Nota (solo si está aprobado o reprobado) */}
          <Input
            etiqueta="Nota Final"
            tipo="number"
            valor={formData.nota?.toString() || ''}
            onChange={(v) => setFormData({
              ...formData,
              nota: v ? parseFloat(v) : undefined
            })}
            deshabilitado={formData.estado === 'pendiente' || formData.estado === 'cursando'}
            ayuda={
              formData.estado === 'pendiente' || formData.estado === 'cursando'
                ? 'Solo disponible para materias aprobadas o reprobadas'
                : 'Escala de 1.0 a 7.0'
            }
            placeholder="1.0 - 7.0"
          />

          {/* Oportunidad */}
          <Input
            etiqueta="Oportunidad"
            tipo="number"
            valor={(formData.oportunidad || 1).toString()}
            onChange={(v) => setFormData({
              ...formData,
              oportunidad: v ? parseInt(v) : 1
            })}
            ayuda="En qué oportunidad está cursando esta materia (1ra, 2da, 3ra...)"
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

        {/* ACCIONES */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
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
          >
            Guardar Cambios
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};