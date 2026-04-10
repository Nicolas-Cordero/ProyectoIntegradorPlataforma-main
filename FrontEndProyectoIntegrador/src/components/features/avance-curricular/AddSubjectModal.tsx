import React, { useState } from 'react';
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
  Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AddIcon /> Agregar Nueva Materia - Semestre {semestre}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Nombre del Ramo *"
            placeholder="Ej: Cálculo I"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="Créditos SCT"
              value={formData.creditos}
              onChange={(e) => setFormData({ ...formData, creditos: parseInt(e.target.value) || 0 })}
            />

            <FormControl fullWidth>
              <InputLabel>Estado Inicial</InputLabel>
              <Select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as Ramo['estado'] })}
                label="Estado Inicial"
              >
                <MenuItem value="pendiente">⏳ Pendiente</MenuItem>
                <MenuItem value="cursando">📚 Cursando</MenuItem>
                <MenuItem value="aprobado">✅ Aprobado</MenuItem>
                <MenuItem value="reprobado">❌ Reprobado</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {(formData.estado === 'aprobado' || formData.estado === 'reprobado') && (
            <TextField
              fullWidth
              type="number"
              label="Nota Final"
              value={formData.nota ?? ''}
              onChange={(e) => setFormData({ ...formData, nota: e.target.value ? parseFloat(e.target.value) : undefined })}
            />
          )}

          <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{formData.nombre || 'Nombre del ramo'}</Typography>
            <Typography variant="body2">{formData.creditos} créditos SCT - {formData.estado}</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={!formData.nombre}>Agregar Materia</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSubjectModal;
