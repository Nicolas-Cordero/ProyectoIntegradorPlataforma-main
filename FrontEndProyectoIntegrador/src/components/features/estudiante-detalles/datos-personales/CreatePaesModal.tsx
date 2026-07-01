import { useState, useEffect } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { Modal, Alert, Button } from '../../../../components/ui';
import { paesService } from '../../../../services';
import type { CreatePaesDto } from '../../../../services/paes.service';
import type { Paes } from '../../../../types';

const INPUT_CLASS =
  'w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B] bg-white transition-colors';

const LABEL_CLASS = 'block text-xs font-semibold text-gray-600 mb-1';

interface CreatePaesModalProps {
  open: boolean;
  rutEstudiante: string;
  onClose: () => void;
  onSuccess: (paes: Paes) => void;
}

export function CreatePaesModal({ open, rutEstudiante, onClose, onSuccess }: CreatePaesModalProps) {
  const EMPTY = { lenguaje: '', matematicas: '', nem: '', ranking: '', matematicas2: '', ciencias: '', historia: '' };
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setForm(EMPTY); setError(''); }
  }, [open]);

  const set = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = (): string => {
    if (!form.lenguaje) return 'Competencia Lectora es obligatoria.';
    if (isNaN(Number(form.lenguaje))) return 'Competencia Lectora debe ser un número.';
    if (!form.matematicas) return 'Competencia Matemática M1 es obligatoria.';
    if (isNaN(Number(form.matematicas))) return 'Competencia Matemática M1 debe ser un número.';
    if (!form.nem) return 'NEM es obligatorio.';
    if (isNaN(Number(form.nem))) return 'NEM debe ser un número.';
    if (!form.ranking) return 'Ranking es obligatorio.';
    if (isNaN(Number(form.ranking))) return 'Ranking debe ser un número.';
    if (form.matematicas2 && isNaN(Number(form.matematicas2))) return 'Competencia Matemática M2 debe ser un número.';
    if (form.ciencias && isNaN(Number(form.ciencias))) return 'Ciencias debe ser un número.';
    if (form.historia && isNaN(Number(form.historia))) return 'Historia y Ciencias Sociales debe ser un número.';
    return '';
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    try {
      const dto: CreatePaesDto = {
        rut_estudiante: rutEstudiante,
        lenguaje: Number(form.lenguaje),
        matematicas: Number(form.matematicas),
        nem: Number(form.nem),
        ranking: Number(form.ranking),
        ...(form.matematicas2 ? { matematicas2: Number(form.matematicas2) } : {}),
        ...(form.ciencias ? { ciencias: Number(form.ciencias) } : {}),
        ...(form.historia ? { historia: Number(form.historia) } : {}),
      };
      const result = await paesService.createPaes(dto);
      onSuccess(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al registrar los puntajes PAES.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      titulo="Registrar Puntajes PAES"
      abierto={open}
      onCerrar={() => { if (!loading) onClose(); }}
      tamanio="md"
      acciones={
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <Button variante="outline" tamano="md" onClick={onClose} deshabilitado={loading}>
            Cancelar
          </Button>
          <Button variante="primary" tamano="md" onClick={handleSubmit} cargando={loading}>
            Registrar
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && (
          <Alert tipo="error" mensaje={error} cerrable onCerrar={() => setError('')} />
        )}

        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#65B39B', mt: 0.5 }}>
          Puntajes obligatorios
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <div>
            <label className={LABEL_CLASS}>Competencia Lectora *</label>
            <input type="number" value={form.lenguaje} onChange={set('lenguaje')} disabled={loading} placeholder="ej: 600" className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Competencia Matemática M1 *</label>
            <input type="number" value={form.matematicas} onChange={set('matematicas')} disabled={loading} placeholder="ej: 550" className={INPUT_CLASS} />
          </div>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <div>
            <label className={LABEL_CLASS}>NEM *</label>
            <input type="number" value={form.nem} onChange={set('nem')} disabled={loading} placeholder="ej: 650" className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Ranking *</label>
            <input type="number" value={form.ranking} onChange={set('ranking')} disabled={loading} placeholder="ej: 700" className={INPUT_CLASS} />
          </div>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#65B39B' }}>
          Puntajes opcionales
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          <div>
            <label className={LABEL_CLASS}>Matemática M2</label>
            <input type="number" value={form.matematicas2} onChange={set('matematicas2')} disabled={loading} placeholder="ej: 500" className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Ciencias</label>
            <input type="number" value={form.ciencias} onChange={set('ciencias')} disabled={loading} placeholder="ej: 500" className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Historia y Cs. Sociales</label>
            <input type="number" value={form.historia} onChange={set('historia')} disabled={loading} placeholder="ej: 500" className={INPUT_CLASS} />
          </div>
        </Box>
      </Box>
    </Modal>
  );
}
