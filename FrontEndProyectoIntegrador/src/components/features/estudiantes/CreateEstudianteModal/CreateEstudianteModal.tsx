import React, { useState, useEffect } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { Modal, Input, Select, Alert, Button } from '../../../ui';
import { estudianteService } from '../../../../services';
import { normalizarRut, normalizarTelefono, esTelefonoValido } from '../../../../utils/validators';
import { LiceoSelector } from '../LiceoSelector';
import type { Generacion, Genero } from '../../../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Si se pasa, se usa directamente y NO se muestra el selector de generación */
  generacionId?: number;
}

interface FormState {
  rut_estudiante: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string; // YYYY-MM-DD (valor del <input type="date">)
  direccion: string;
  genero: Genero | '';
  rbd_liceo: string;
  promedios_media: string;
  generacion_id: string; // string para el <select>
}

const EMPTY: FormState = {
  rut_estudiante: '',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  fecha_nacimiento: '',
  direccion: '',
  genero: '',
  rbd_liceo: '',
  promedios_media: '',
  generacion_id: '',
};


const INPUT_CLASS =
  'w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B] bg-white transition-colors';

const LABEL_CLASS = 'block text-xs font-semibold text-gray-600 mb-1';

export const CreateEstudianteModal: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  generacionId,
}) => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generaciones, setGeneraciones] = useState<Generacion[]>([]);

  // Carga generaciones al abrir
  useEffect(() => {
    if (!open) return;
    if (generacionId === undefined) {
      estudianteService.getGenerations().then(setGeneraciones).catch(() => {});
    }
  }, [open, generacionId]);

  // Resetea el form al abrir
  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY, generacion_id: generacionId ? String(generacionId) : '' });
      setError('');
    }
  }, [open, generacionId]);

  // Acepta string | number porque Select.onChange emite ese tipo; el form guarda strings.
  const set = (field: keyof FormState) => (value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: String(value) }));

  const validate = (): string => {
    if (!form.rut_estudiante.trim()) return 'El RUT es obligatorio.';
    if (!form.nombre.trim() || form.nombre.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres.';
    if (!form.apellido.trim() || form.apellido.trim().length < 2) return 'El apellido debe tener al menos 2 caracteres.';
    if (!form.email.includes('@')) return 'Ingresa un email válido.';
    if (!esTelefonoValido(form.telefono)) return 'Teléfono inválido. Ej: 912345678 · 56912345678 · +569 1234 5678';
    if (!form.fecha_nacimiento) return 'La fecha de nacimiento es obligatoria.';
    if (!form.direccion.trim()) return 'La dirección es obligatoria.';
    if (!form.genero) return 'El género es obligatorio.';
    if (!form.rbd_liceo.trim()) return 'El RBD del liceo es obligatorio.';
    const prom = parseFloat(form.promedios_media);
    if (isNaN(prom) || prom < 1 || prom > 7) return 'El promedio debe estar entre 1.0 y 7.0.';
    if (generacionId === undefined && !form.generacion_id) return 'La generación es obligatoria.';
    return '';
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');
    try {
      const prom = parseFloat(form.promedios_media);
      // Redondear a 1 decimal para cumplir con Decimal(3,1)
      const promRedondeado = Math.round(prom * 10) / 10;

      await estudianteService.create({
        rut_estudiante: normalizarRut(form.rut_estudiante),
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        telefono: normalizarTelefono(form.telefono),
        generacion_id: generacionId ?? parseInt(form.generacion_id),
        fecha_nacimiento: new Date(form.fecha_nacimiento).toISOString(),
        direccion: form.direccion.trim(),
        genero: form.genero as Genero,
        rbd_liceo: form.rbd_liceo.trim(),
        promedios_media: promRedondeado,
      });
      onSuccess();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear el estudiante. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const tituloGeneracion = generacionId
    ? `Generación ${generaciones.find((g) => g.id === generacionId)?.año ?? generacionId}`
    : '';

  return (
    <Modal
      titulo={`Nuevo Estudiante${tituloGeneracion ? ` — ${tituloGeneracion}` : ''}`}
      abierto={open}
      onCerrar={handleClose}
      tamanio="lg"
      acciones={
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <Button variante="outline" tamano="md" onClick={handleClose} deshabilitado={loading}>
            Cancelar
          </Button>
          <Button variante="primary" tamano="md" onClick={handleSubmit} cargando={loading}>
            Crear Estudiante
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && (
          <Alert tipo="error" mensaje={error} cerrable onCerrar={() => setError('')} />
        )}

        {/* ── Sección 1: Identificación ── */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#65B39B', mt: 0.5 }}>
          Identificación
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Input
            etiqueta="RUT *"
            valor={form.rut_estudiante}
            onChange={set('rut_estudiante')}
            placeholder="12.345.678-9 · 12345678-9 · 123456789"
            deshabilitado={loading}
          />
          <Input
            etiqueta="Email *"
            tipo="email"
            valor={form.email}
            onChange={set('email')}
            placeholder="estudiante@correo.com"
            deshabilitado={loading}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Input
            etiqueta="Nombre *"
            valor={form.nombre}
            onChange={set('nombre')}
            placeholder="Juan"
            deshabilitado={loading}
          />
          <Input
            etiqueta="Apellido *"
            valor={form.apellido}
            onChange={set('apellido')}
            placeholder="Pérez González"
            deshabilitado={loading}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <div>
            <label className={LABEL_CLASS}>Fecha de Nacimiento *</label>
            <input
              type="date"
              value={form.fecha_nacimiento}
              onChange={(e) => set('fecha_nacimiento')(e.target.value)}
              disabled={loading}
              max={new Date().toISOString().split('T')[0]}
              className={INPUT_CLASS}
            />
          </div>
          <Select
            etiqueta="Género *"
            opciones={[
              { valor: 'MASCULINO', etiqueta: 'Masculino' },
              { valor: 'FEMENINO', etiqueta: 'Femenino' },
              { valor: 'NO_BINARIO', etiqueta: 'No binario' },
            ]}
            valor={form.genero}
            onChange={set('genero')}
            deshabilitado={loading}
          />
        </Box>

        <Input
          etiqueta="Teléfono *"
          tipo="tel"
          valor={form.telefono}
          onChange={set('telefono')}
          placeholder="912345678"
          ayuda="Acepta: 912345678 · 56912345678 · +56 9 1234 5678"
          deshabilitado={loading}
        />

        <Divider sx={{ my: 0.5 }} />

        {/* ── Sección 2: Datos académicos ── */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#65B39B' }}>
          Datos Académicos
        </Typography>

        {/* Solo muestra el selector de generación cuando NO se pasa generacionId */}
        {generacionId === undefined && (
          <div>
            <label className={LABEL_CLASS}>Generación *</label>
            <select
              value={form.generacion_id}
              onChange={(e) => set('generacion_id')(e.target.value)}
              disabled={loading}
              className={INPUT_CLASS}
            >
              <option value="">Selecciona una generación</option>
              {generaciones.map((g) => (
                <option key={g.id} value={String(g.id)}>
                  {g.año}{g.descripcion ? ` — ${g.descripcion}` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <LiceoSelector value={form.rbd_liceo} onChange={set('rbd_liceo')} disabled={loading} />

          <Input
            etiqueta="Dirección *"
            valor={form.direccion}
            onChange={set('direccion')}
            placeholder="Calle Ejemplo 123"
            deshabilitado={loading}
          />
        </Box>

        <Input
          etiqueta="Promedio Media * (1.0 – 7.0)"
          tipo="number"
          valor={form.promedios_media}
          onChange={set('promedios_media')}
          placeholder="5.5"
          deshabilitado={loading}
        />

      </Box>
    </Modal>
  );
};
