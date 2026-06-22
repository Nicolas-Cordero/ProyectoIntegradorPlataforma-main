import React, { useState, useEffect } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { Modal, Input, Select, Alert, Button } from '../../../ui';
import { estudianteService, liceoService } from '../../../../services';
import { normalizarRut, normalizarTelefono, esTelefonoValido } from '../../../../utils/validators';
import type { Generacion, Genero, EstadoEstudiante, Liceo } from '../../../../types';

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
  estado: EstadoEstudiante | '';
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
  estado: 'ACTIVO',
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
  const [liceos, setLiceos] = useState<Liceo[]>([]);
  const [liceoSearch, setLiceoSearch] = useState('');

  // Carga generaciones y liceos al abrir
  useEffect(() => {
    if (!open) return;
    if (generacionId === undefined) {
      estudianteService.getGenerations().then(setGeneraciones).catch(() => {});
    }
    liceoService.getAll().then(setLiceos).catch(() => {});
  }, [open, generacionId]);

  // Resetea el form al abrir
  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY, generacion_id: generacionId ? String(generacionId) : '' });
      setError('');
      setLiceoSearch('');
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
    if (!form.estado) return 'El estado es obligatorio.';
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
        estado: form.estado as EstadoEstudiante,
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
          {/* Selector de liceo con búsqueda */}
          <div>
            <label className={LABEL_CLASS}>Liceo *</label>
            <input
              type="text"
              value={liceoSearch}
              onChange={(e) => {
                setLiceoSearch(e.target.value);
                // Si el usuario escribe algo distinto al liceo seleccionado, limpiar la selección
                const seleccionado = liceos.find((l) => l.rbd === form.rbd_liceo);
                if (seleccionado && e.target.value !== `${seleccionado.nombre} (${seleccionado.rbd})`) {
                  set('rbd_liceo')('');
                }
              }}
              placeholder="Buscar liceo por nombre o RBD..."
              disabled={loading}
              className={INPUT_CLASS}
            />
            {/* Dropdown de opciones filtradas */}
            {liceoSearch && !form.rbd_liceo && (() => {
              const lower = liceoSearch.toLowerCase();
              const opciones = liceos.filter(
                (l) =>
                  l.nombre.toLowerCase().includes(lower) ||
                  l.rbd.toLowerCase().includes(lower) ||
                  (l.comuna ?? '').toLowerCase().includes(lower)
              ).slice(0, 8);
              if (opciones.length === 0) return null;
              return (
                <div className="border border-gray-200 rounded-lg mt-1 bg-white shadow-lg z-10 max-h-48 overflow-y-auto">
                  {opciones.map((l) => (
                    <button
                      key={l.rbd}
                      type="button"
                      onClick={() => {
                        set('rbd_liceo')(l.rbd);
                        setLiceoSearch(`${l.nombre} (${l.rbd})`);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#65B39B]/10 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium text-gray-800">{l.nombre}</span>
                      <span className="text-gray-400 text-xs ml-2">RBD: {l.rbd}</span>
                      {l.comuna && (
                        <span className="text-gray-400 text-xs ml-1">— {l.comuna}</span>
                      )}
                    </button>
                  ))}
                </div>
              );
            })()}
            {form.rbd_liceo && (
              <p className="text-xs text-[#65B39B] mt-1 font-medium">
                ✓ RBD seleccionado: {form.rbd_liceo}
              </p>
            )}
          </div>

          <Input
            etiqueta="Dirección *"
            valor={form.direccion}
            onChange={set('direccion')}
            placeholder="Calle Ejemplo 123"
            deshabilitado={loading}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Input
            etiqueta="Promedio Media * (1.0 – 7.0)"
            tipo="number"
            valor={form.promedios_media}
            onChange={set('promedios_media')}
            placeholder="5.5"
            deshabilitado={loading}
          />
          <Select
            etiqueta="Estado *"
            opciones={[
              { valor: 'ACTIVO',     etiqueta: 'Activo'     },
              { valor: 'SUSPENDIDO', etiqueta: 'Suspendido' },
              { valor: 'RETIRADO', etiqueta: 'Retirado' },
              { valor: 'EGRESADO', etiqueta: 'Egresado' },
              { valor: 'TITULADO', etiqueta: 'Titulado' },
              { valor: 'ELIMINADO', etiqueta: 'Eliminado' },
            ]}
            valor={form.estado}
            onChange={set('estado')}
            deshabilitado={loading}
          />
        </Box>

      </Box>
    </Modal>
  );
};
