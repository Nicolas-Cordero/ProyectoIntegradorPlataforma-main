/**
 * Modal para crear nueva entrevista
 */
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton, Box } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { entrevistaService } from '../../../../services';
import { authService } from '../../../../services/authService';

interface NuevaEntrevistaModalProps {
  open: boolean;
  onClose: () => void;
  estudianteId: string | number;
}

export function NuevaEntrevistaModal({ open, onClose, estudianteId }: NuevaEntrevistaModalProps) {
  const navigate = useNavigate();
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [observaciones, setObservaciones] = useState('');
  const [temas, setTemas] = useState('');
  const [duracionMinutos, setDuracionMinutos] = useState<number>(60);
  const [informacionAdicional, setInformacionAdicional] = useState('');
  const [estadoEntrevista, setEstadoEntrevista] = useState<'programada' | 'completada' | 'cancelada' | 'reprogramada'>('completada');
  const [hora, setHora] = useState<string>(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = authService.getCurrentUser();
  const [nombreEntrevistador, setNombreEntrevistador] = useState(
    user ? `${user.nombres || ''} ${user.apellidos || ''}`.trim() || user.email || 'Entrevistador' : 'Usuario Actual'
  );

  const handleCrearEntrevista = async () => {
    // Prevenir múltiples envíos
    if (isSubmitting) {
      console.log('⚠️ Ya se está procesando una solicitud');
      return;
    }

    setIsSubmitting(true);

    const user = authService.getCurrentUser();
    if (!user) {
      alert('Debes iniciar sesión para crear una entrevista.');
      return;
    }

    try {
      // Construir fecha y hora local sin desfases de zona
      const [yearStr, monthStr, dayStr] = fecha.split('-');
      const [hourStr, minuteStr] = (hora || '12:00').split(':');
      const fechaLocal = new Date(
        Number(yearStr),
        Number(monthStr) - 1,
        Number(dayStr),
        Number(hourStr),
        Number(minuteStr) || 0,
        0,
        0
      );

      // Calcular siguiente número de entrevista del estudiante considerando solo el año de la nueva fecha
      const entrevistasPrevias = await entrevistaService.getByEstudiante(String(estudianteId));
      const entrevistasDelAnio = entrevistasPrevias.filter((ent) => {
        const fechaEnt = new Date((ent as any).fecha);
        return !Number.isNaN(fechaEnt.getTime()) && fechaEnt.getFullYear() === fechaLocal.getFullYear();
      });

      const maxNumero = entrevistasDelAnio.reduce((max, ent) => {
        const n = (ent as any).numero_entrevista ?? (ent as any).numero_Entrevista;
        return typeof n === 'number' ? Math.max(max, n) : max;
      }, 0);

      // Valores requeridos por el DTO del backend
      const payload = {
        id_estudiante: String(estudianteId),
        fecha: fechaLocal.toISOString(),
        nombre_tutor: nombreEntrevistador.trim() || `${user.nombres || ''} ${user.apellidos || ''}`.trim() || user.email || 'Entrevistador',
        año: fechaLocal.getFullYear(),
        numero_entrevista: maxNumero + 1,
        duracion_minutos: duracionMinutos,
        estado: estadoEntrevista,
        observaciones: observaciones.trim() ? observaciones.trim() : undefined,
        informacion_adicional: informacionAdicional.trim() ? informacionAdicional.trim() : undefined,
        temas_abordados: temas
          ? temas.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      } as const;

      const entrevistaCreada = await entrevistaService.create(payload as any);
      const nuevoId = (entrevistaCreada as any)?.id || (entrevistaCreada as any)?._id || estudianteId;

      onClose();
      navigate(`/entrevista/${nuevoId}`);
    } catch (err) {
      console.error('Error creando entrevista', err);
      alert('No se pudo crear la entrevista. Revisa los datos e inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        ➕ Nueva Entrevista
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Hora"
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Entrevistador"
            value={nombreEntrevistador}
            required
            fullWidth
            onChange={(e) => setNombreEntrevistador(e.target.value)}
          />

          <TextField
            label="Entrevistador"
            value={nombreEntrevistador}
            disabled
            fullWidth
            helperText="Se usará tu usuario autenticado como entrevistador"
          />

          <TextField
            label="Temas a tratar (opcional)"
            placeholder="Ej: Rendimiento académico, situación familiar..."
            fullWidth
            value={temas}
            onChange={(e) => setTemas(e.target.value)}
            helperText="Separar con comas"
          />

          <TextField
            label="Observaciones Generales (opcional)"
            placeholder="Observaciones iniciales de la entrevista..."
            multiline
            rows={4}
            fullWidth
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />

          <TextField
            label="Información adicional (opcional)"
            placeholder="Notas o información relevante que no provenga de una entrevista"
            multiline
            rows={4}
            fullWidth
            value={informacionAdicional}
            onChange={(e) => setInformacionAdicional(e.target.value)}
            helperText="No es obligatoria y puedes editarla luego"
          />

          <TextField
            label="Duración (minutos)"
            type="number"
            fullWidth
            inputProps={{ min: 15, max: 180, step: 5 }}
            value={duracionMinutos}
            onChange={(e) => setDuracionMinutos(Number(e.target.value) || 60)}
          />

          <TextField
            label="Estado"
            select
            fullWidth
            value={estadoEntrevista}
            onChange={(e) => setEstadoEntrevista(e.target.value as any)}
            SelectProps={{ native: true }}
          >
            <option value="programada">Programada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
            <option value="reprogramada">Reprogramada</option>
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleCrearEntrevista} variant="contained" color="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear y Abrir Entrevista'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
