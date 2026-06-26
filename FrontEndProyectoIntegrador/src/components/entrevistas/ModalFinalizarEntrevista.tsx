import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, CircularProgress, Alert,
} from '@mui/material';

interface Props {
  abierto: boolean;
  horaInicio: Date;
  onCancelar: () => void;
  onConfirmar: (params: {
    fechaHora?: Date;
    duracionS: number;
    resumen?: string;
  }) => Promise<void>;
  enviando: boolean;
  errorEnvio: string | null;
}

export function ModalFinalizarEntrevista({
  abierto,
  horaInicio,
  onCancelar,
  onConfirmar,
  enviando,
  errorEnvio,
}: Props) {
  const [fechaHoraRaw, setFechaHoraRaw] = useState('');
  const [duracionRaw, setDuracionRaw] = useState('');
  const [resumen, setResumen] = useState('');

  // Calcula segundos transcurridos desde horaInicio hasta ahora como fallback
  function calcularDuracion(): number {
    if (duracionRaw.trim() !== '') {
      const n = parseInt(duracionRaw, 10);
      if (!isNaN(n) && n >= 0) return n;
    }
    return Math.max(0, Math.floor((Date.now() - horaInicio.getTime()) / 1000));
  }

  async function handleConfirmar() {
    const fechaHora = fechaHoraRaw ? new Date(fechaHoraRaw) : undefined;
    const duracionS = calcularDuracion();
    await onConfirmar({ fechaHora, duracionS, resumen: resumen.trim() || undefined });
  }

  return (
    <Dialog
      open={abierto}
      onClose={enviando ? undefined : onCancelar}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, backgroundColor: '#FFFEF5' } }}
    >
      <DialogTitle sx={{ fontWeight: 600, color: '#333' }}>
        Finalizar entrevista
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {errorEnvio && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {errorEnvio}
          </Alert>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Fecha y hora de inicio <span className="text-gray-400 font-normal">(opcional — si se deja vacío se usa la hora en que se abrió el panel)</span>
          </label>
          <input
            type="datetime-local"
            value={fechaHoraRaw}
            onChange={(e) => setFechaHoraRaw(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#65B39B]"
            disabled={enviando}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Duración (segundos) <span className="text-gray-400 font-normal">(opcional — si se deja vacío se calcula automáticamente)</span>
          </label>
          <input
            type="number"
            min={0}
            value={duracionRaw}
            onChange={(e) => setDuracionRaw(e.target.value)}
            placeholder={`${calcularDuracion()} s (calculado)`}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#65B39B]"
            disabled={enviando}
          />
        </div>

        <TextField
          label="Resumen (opcional)"
          value={resumen}
          onChange={(e) => setResumen(e.target.value)}
          multiline
          rows={3}
          fullWidth
          size="small"
          disabled={enviando}
          sx={{ '& .MuiInputBase-root': { fontFamily: "'Assistant', sans-serif" } }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0', gap: 1 }}>
        <Button onClick={onCancelar} disabled={enviando} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmar}
          disabled={enviando}
          variant="contained"
          sx={{ backgroundColor: '#65B39B', '&:hover': { backgroundColor: '#4A9B7D' } }}
          startIcon={enviando ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {enviando ? 'Guardando...' : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
