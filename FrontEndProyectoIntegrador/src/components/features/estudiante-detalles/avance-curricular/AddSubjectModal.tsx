import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Modal, Input, Select, Button } from '../../../ui';

interface Ramo {
  nombre: string;
  creditos: number;
  prerequisitos: string[];
  estado: 'pendiente' | 'cursando' | 'aprobado' | 'reprobado';
  nota?: number;
}

interface AddSubjectModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (nuevoRamo: Ramo) => void;
  semestre: number | string;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  open,
  onClose,
  onSave,
  semestre
}) => {
  const [formData, setFormData] = useState<Ramo>({
    nombre: '',
    creditos: 5,
    prerequisitos: [],
    estado: 'pendiente'
  });

  const handleSave = () => {
    if (formData.nombre) {
      onSave(formData);
      setFormData({ nombre: '', creditos: 5, prerequisitos: [], estado: 'pendiente' });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ nombre: '', creditos: 5, prerequisitos: [], estado: 'pendiente' });
    onClose();
  };

  const ESTADOS_OPTIONS = [
    { valor: 'pendiente', etiqueta: '⏳ Pendiente' },
    { valor: 'cursando', etiqueta: '📚 Cursando' },
    { valor: 'aprobado', etiqueta: '✅ Aprobado' },
    { valor: 'reprobado', etiqueta: '❌ Reprobado' }
  ];

  return (
    <Modal
      titulo={`Agregar Nueva Materia - Semestre ${semestre}`}
      abierto={open}
      onCerrar={handleClose}
      tamanio="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Input
          etiqueta="Nombre del Ramo"
          valor={formData.nombre}
          onChange={(v) => setFormData({ ...formData, nombre: v })}
          placeholder="Ej: Cálculo I"
          requerido
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Input
            etiqueta="Créditos SCT"
            tipo="number"
            valor={String(formData.creditos)}
            onChange={(v) => setFormData({ ...formData, creditos: parseInt(v) || 0 })}
          />

          <Select
            etiqueta="Estado Inicial"
            opciones={ESTADOS_OPTIONS}
            valor={formData.estado}
            onChange={(v) => setFormData({ ...formData, estado: v as Ramo['estado'] })}
          />
        </Box>

        {(formData.estado === 'aprobado' || formData.estado === 'reprobado') && (
          <Input
            etiqueta="Nota Final"
            tipo="number"
            valor={String(formData.nota ?? '')}
            onChange={(v) => setFormData({ ...formData, nota: v ? parseFloat(v) : undefined })}
          />
        )}

        <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {formData.nombre || 'Nombre del ramo'}
          </Typography>
          <Typography variant="body2">
            {formData.creditos} créditos SCT - {formData.estado}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
          <Button variante="outline" tamano="md" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            variante="primary" 
            tamano="md" 
            onClick={handleSave} 
            deshabilitado={!formData.nombre}
          >
            Agregar Materia
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddSubjectModal;
