/**
 * Modal para crear nueva entrevista
 */
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Box } from '@mui/material';
import { Modal, Input, Textarea, Select, Button } from '../../../ui';
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
    if (isSubmitting) return;
    setIsSubmitting(true);

    const user = authService.getCurrentUser();
    if (!user) {
      alert('Debes iniciar sesión para crear una entrevista.');
      setIsSubmitting(false);
      return;
    }

    try {
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

      const entrevistasPrevias = await entrevistaService.getByEstudiante(String(estudianteId));
      const entrevistasDelAnio = entrevistasPrevias.filter((ent) => {
        const fechaEnt = new Date((ent as any).fecha);
        return !Number.isNaN(fechaEnt.getTime()) && fechaEnt.getFullYear() === fechaLocal.getFullYear();
      });

      const maxNumero = entrevistasDelAnio.reduce((max, ent) => {
        const n = (ent as any).numero_entrevista ?? (ent as any).numero_Entrevista;
        return typeof n === 'number' ? Math.max(max, n) : max;
      }, 0);

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

  const ESTADOS_OPTION = [
    { valor: 'programada', etiqueta: 'Programada' },
    { valor: 'completada', etiqueta: 'Completada' },
    { valor: 'cancelada', etiqueta: 'Cancelada' },
    { valor: 'reprogramada', etiqueta: 'Reprogramada' }
  ];

  return (
    <Modal
      titulo="➕ Nueva Entrevista"
      abierto={open}
      onCerrar={onClose}
      tamanio="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Input
          etiqueta="Fecha"
          tipo="text"
          valor={fecha}
          onChange={setFecha}
          requerido
        />

        <Input
          etiqueta="Hora"
          tipo="text"
          valor={hora}
          onChange={setHora}
          placeholder="HH:MM"
          requerido
        />

        <Input
          etiqueta="Entrevistador"
          valor={nombreEntrevistador}
          onChange={setNombreEntrevistador}
          requerido
        />

        <Input
          etiqueta="Temas a tratar (opcional)"
          valor={temas}
          onChange={setTemas}
          placeholder="Ej: Rendimiento académico, situación familiar..."
          ayuda="Separar con comas"
        />

        <Textarea
          etiqueta="Observaciones Generales (opcional)"
          valor={observaciones}
          onChange={setObservaciones}
          placeholder="Observaciones iniciales de la entrevista..."
          filas={4}
        />

        <Textarea
          etiqueta="Información adicional (opcional)"
          valor={informacionAdicional}
          onChange={setInformacionAdicional}
          placeholder="Notas o información relevante que no provenga de una entrevista"
          filas={4}
          ayuda="No es obligatoria y puedes editarla luego"
        />

        <Input
          etiqueta="Duración (minutos)"
          tipo="number"
          valor={String(duracionMinutos)}
          onChange={(v) => setDuracionMinutos(Number(v) || 60)}
        />

        <Select
          etiqueta="Estado"
          opciones={ESTADOS_OPTION}
          valor={estadoEntrevista}
          onChange={(v) => setEstadoEntrevista(v as any)}
          requerido
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
          <Button variante="outline" tamano="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variante="primary" 
            tamano="md" 
            onClick={handleCrearEntrevista} 
            deshabilitado={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear y Abrir Entrevista'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
