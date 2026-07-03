import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, CircularProgress, Alert,
} from '@mui/material';
import { DuracionHmsInput } from './DuracionHmsInput';

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
  const [duracionS, setDuracionS] = useState(0);
  const [resumen, setResumen] = useState('');

  // Al abrir el modal, precarga la duración con el tiempo transcurrido desde horaInicio.
  useEffect(() => {
    if (abierto) {
      setDuracionS(Math.max(0, Math.floor((Date.now() - horaInicio.getTime()) / 1000)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  async function handleConfirmar() {
    let fechaHora: Date | undefined;
    if (fechaHoraRaw) {
      const [year, month, day] = fechaHoraRaw.split('-').map(Number);
      fechaHora = new Date(year, month - 1, day); // hora local 00:00, sin salto de día por UTC
    }
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
          <label className="block text-base font-medium text-gray-600 mb-1">
            Fecha de la entrevista <span className="text-gray-400 font-normal">· opcional, si se deja vacío se usa la hora en que se abrió el panel</span>
          </label>
          <input
            type="date"
            value={fechaHoraRaw}
            onChange={(e) => setFechaHoraRaw(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:ring-1 focus:ring-[#65B39B]"
            disabled={enviando}
          />
        </div>

        <DuracionHmsInput
          etiqueta="Duración · precargada con el tiempo transcurrido, ajústala si es necesario"
          totalSegundos={duracionS}
          onChange={setDuracionS}
          disabled={enviando}
        />

        <TextField
          label="Resumen · opcional"
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
