/**
 * Modal para crear nuevo semestre
 */
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton, Box, MenuItem } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface NuevoSemestreData {
  año: number;
  semestre: number;
  nivel_educativo: string;
  ramos_aprobados: number;
  ramos_reprobados: number;
  ramos_eliminados: number;
  promedio_semestre: number;
  trayectoria_academica: any[];
}

interface NuevoSemestreModalProps {
  open: boolean;
  onClose: () => void;
  nuevoSemestreData: NuevoSemestreData;
  setNuevoSemestreData: React.Dispatch<React.SetStateAction<NuevoSemestreData>>;
  onCrearSemestre: () => void;
}

export function NuevoSemestreModal({ 
  open, 
  onClose, 
  nuevoSemestreData, 
  setNuevoSemestreData, 
  onCrearSemestre 
}: NuevoSemestreModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        ➕ Crear Nuevo Semestre
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Año"
              type="number"
              value={nuevoSemestreData.año}
              onChange={(e) => setNuevoSemestreData(prev => ({
                ...prev,
                año: parseInt(e.target.value) || new Date().getFullYear()
              }))}
              required
              inputProps={{ min: 2020, max: 2030 }}
            />

            <TextField
              label="Semestre"
              select
              value={nuevoSemestreData.semestre}
              onChange={(e) => setNuevoSemestreData(prev => ({
                ...prev,
                semestre: parseInt(e.target.value)
              }))}
              required
            >
              <MenuItem value={1}>Primer Semestre</MenuItem>
              <MenuItem value={2}>Segundo Semestre</MenuItem>
            </TextField>
          </Box>

          <TextField
            label="Nivel Educativo"
            value={nuevoSemestreData.nivel_educativo}
            onChange={(e) => setNuevoSemestreData(prev => ({
              ...prev,
              nivel_educativo: e.target.value
            }))}
            placeholder="Ej: Superior, Media, Técnico"
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            <TextField
              label="Ramos Aprobados"
              type="number"
              value={nuevoSemestreData.ramos_aprobados}
              onChange={(e) => setNuevoSemestreData(prev => ({
                ...prev,
                ramos_aprobados: parseInt(e.target.value) || 0
              }))}
              inputProps={{ min: 0 }}
            />

            <TextField
              label="Ramos Reprobados"
              type="number"
              value={nuevoSemestreData.ramos_reprobados}
              onChange={(e) => setNuevoSemestreData(prev => ({
                ...prev,
                ramos_reprobados: parseInt(e.target.value) || 0
              }))}
              inputProps={{ min: 0 }}
            />

            <TextField
              label="Ramos Eliminados"
              type="number"
              value={nuevoSemestreData.ramos_eliminados}
              onChange={(e) => setNuevoSemestreData(prev => ({
                ...prev,
                ramos_eliminados: parseInt(e.target.value) || 0
              }))}
              inputProps={{ min: 0 }}
            />
          </Box>

          <TextField
            label="Promedio del Semestre"
            type="number"
            value={nuevoSemestreData.promedio_semestre}
            onChange={(e) => setNuevoSemestreData(prev => ({
              ...prev,
              promedio_semestre: parseFloat(e.target.value) || 0
            }))}
            inputProps={{ min: 1.0, max: 7.0, step: 0.1 }}
            placeholder="Ej: 5.5"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancelar
        </Button>
        <Button onClick={onCrearSemestre} variant="contained" color="primary">
          Crear Semestre
        </Button>
      </DialogActions>
    </Dialog>
  );
}
