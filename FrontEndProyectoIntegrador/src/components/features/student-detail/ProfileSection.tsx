/**
 * Sección de perfil del estudiante
 * Muestra avatar, información básica y resumen académico
 */
import { Box, Paper, Typography, Avatar, Select, MenuItem, FormControl, CircularProgress, Button, LinearProgress } from '@mui/material';
import { AccountCircle as AccountCircleIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { StatCard } from '../../ui';
import {
  getEstudianteStatus,
  getEstudianteEmail,
  getEstudianteTelefono
} from '../../../utils/migration-helpers';
// Colores personalizados para cada estado
const estadoColorMap: Record<string, string> = {
  activo: '#43a047', // verde
  egresado: '#1976d2', // azul
  inactivo: '#fbc02d', // amarillo
  retirado: '#e53935', // rojo
};
import { useState, useEffect } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import { estadoAcademicoService } from '../../../services';
import { estudianteService } from '../../../services';
import type { Estudiante, StatusEstudiante } from '../../../types';
import type { SeccionActiva } from './TabNavigation';


interface ProfileSectionProps {
  estudiante: Estudiante;
  seccionActiva?: SeccionActiva;
}

export function ProfileSection({ estudiante, seccionActiva }: ProfileSectionProps) {
  const statusInicial = getEstudianteStatus(estudiante) || estudiante.estado || 'activo';
  const [status, setStatus] = useState<StatusEstudiante>(statusInicial as StatusEstudiante);
  const [fotoUrl, setFotoUrl] = useState<string | undefined>(estudiante.foto_url);
  const [subiendo, setSubiendo] = useState(false);
  const [errorUpload, setErrorUpload] = useState('');

  // Sincroniza el estado local si cambia el prop estudiante
  useEffect(() => {
    const nuevoStatus = getEstudianteStatus(estudiante) || estudiante.estado || 'activo';
    setStatus(nuevoStatus as StatusEstudiante);
    setFotoUrl(estudiante.foto_url);
  }, [estudiante]);

  // Si seccionActiva está presente, sincroniza el status cada vez que se vuelve a la pestaña de perfil
  useEffect(() => {
    if (seccionActiva === 'perfil') {
      const nuevoStatus = getEstudianteStatus(estudiante) || estudiante.estado || 'activo';
      setStatus(nuevoStatus as StatusEstudiante);
    }
  }, [seccionActiva, estudiante]);
  const [loading, setLoading] = useState(false);
  const statusOptions: { value: StatusEstudiante; label: string }[] = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'egresado', label: 'Egresado' },
    { value: 'retirado', label: 'Retirado' },
  ];

  const handleStatusChange = async (e: SelectChangeEvent) => {
    const newStatus = e.target.value as StatusEstudiante;
    setStatus(newStatus);
    setLoading(true);
    const estudianteId = (estudiante.id_estudiante ?? estudiante.id) ? String(estudiante.id_estudiante ?? estudiante.id) : '';
    try {
      // Actualizar usando estado-academico.service.ts (upsert crea o actualiza)
      await estadoAcademicoService.upsertByEstudiante(estudianteId, { status: newStatus });
      
      // Actualizar el objeto estudiante local para reflejar el cambio
      (estudiante as any).status = newStatus;
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('No se pudo actualizar el estado.');
      const statusFallback = getEstudianteStatus(estudiante) || estudiante.estado || 'activo';
      setStatus(statusFallback as StatusEstudiante);
    } finally {
      setLoading(false);
    }
  };

  const infoFields = [
    { label: 'Nombre Completo', value: estudiante.nombre },
    { label: 'RUT', value: estudiante.rut },
    { label: 'Correo Electrónico', value: getEstudianteEmail(estudiante) },
    { label: 'Teléfono', value: getEstudianteTelefono(estudiante) },
    { label: 'Universidad', value: estudiante.institucion?.nombre || estudiante.universidad },
    { label: 'Carrera', value: estudiante.institucion?.carrera_especialidad || estudiante.carrera },
    { label: 'Generación', value: estudiante.generacion || estudiante.año_generacion },
    { label: 'Tipo de Estudiante', value: estudiante.tipo_de_estudiante }
  ];

  const semestreActualDisplay = () => {
    const numero = Number(estudiante.semestre);
    if (!Number.isFinite(numero) || numero <= 0) return 'N/A';
    const year = new Date().getFullYear();
    return `${year}-${numero}`;
  };

  const promedioGeneralDisplay = () => {
    const numero = Number((estudiante as any)?.promedio);
    if (!Number.isFinite(numero)) return 'N/A';
    return Number(numero.toFixed(2));
  };

  return (
    <Box>
      {/* Tarjeta de Perfil */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '200px 1fr' }, gap: 4, alignItems: 'start' }}>
          {/* Avatar y Estado */}
          <Box sx={{ textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 180, 
                height: 180, 
                bgcolor: 'grey.300',
                mb: 2,
                mx: 'auto',
                fontSize: '4rem'
              }}
              src={fotoUrl}
              alt={estudiante.nombre}
            >
              {!fotoUrl && <AccountCircleIcon sx={{ fontSize: '8rem', color: 'grey.500' }} />}
            </Avatar>
            <input
              id="upload-avatar"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setErrorUpload('');
                setSubiendo(true);
                try {
                  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
                  const folder = import.meta.env.VITE_CLOUDINARY_FOLDER || 'proyecto-integrador';
                  if (!cloudName || !preset) throw new Error('Faltan variables VITE_CLOUDINARY_CLOUD_NAME o VITE_CLOUDINARY_UPLOAD_PRESET');
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('upload_preset', preset);
                  formData.append('folder', folder);
                  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData,
                  });
                  if (!res.ok) throw new Error('Error subiendo imagen');
                  const data = await res.json();
                  const secureUrl = data.secure_url as string;
                  const estudianteId = (estudiante.id_estudiante ?? estudiante.id) ? String(estudiante.id_estudiante ?? estudiante.id) : '';
                  setFotoUrl(secureUrl);
                  await estudianteService.update(estudianteId, { foto_url: secureUrl });
                } catch (err: any) {
                  setErrorUpload(err.message || 'No se pudo subir la imagen');
                } finally {
                  setSubiendo(false);
                  if (e.target) e.target.value = '';
                }
              }}
            />
            <label htmlFor="upload-avatar">
              <Button
                component="span"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                disabled={subiendo}
                sx={{ mt: 1, textTransform: 'none' }}
              >
                {subiendo ? 'Subiendo...' : 'Cambiar foto'}
              </Button>
            </label>
            {subiendo && <LinearProgress sx={{ mt: 1 }} />}
            {errorUpload && (
              <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                {errorUpload}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              <Typography sx={{ fontWeight: 600, mr: 1, minWidth: 60 }} color="text.secondary">
                Estado:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={status}
                  onChange={handleStatusChange}
                  disabled={loading}
                  displayEmpty
                  sx={{
                    bgcolor: estadoColorMap[status],
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: 2,
                    '.MuiSelect-icon': { color: 'white' },
                    '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                  }}
                >
                  {statusOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
            </Box>
          </Box>

          {/* Información Principal */}
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Información General
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, mt: 3 }}>
              {infoFields.map((field) => (
                <Box key={field.label}>
                  <Typography variant="caption" color="text.secondary">
                    {field.label}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ textTransform: field.label === 'Tipo de Estudiante' ? 'capitalize' : 'none' }}>
                    {field.value || 'No especificado'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Resumen Académico */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Resumen Académico
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mt: 3 }}>
          <StatCard
            icon="📊"
            label="Promedio General"
            value={promedioGeneralDisplay()}
            accentColor="#2196f3"
          />
          <StatCard
            icon="📚"
            label="Semestre Actual"
            value={semestreActualDisplay()}
            accentColor="#4caf50"
          />
          <StatCard
            icon="🎓"
            label="Beca"
            value={estudiante.beca || 'Sin beca'}
            accentColor="#9c27b0"
          />
          <StatCard
            icon="✅"
            label="Estado Académico"
            value={getEstudianteStatus(estudiante) || estudiante.estado || 'N/A'}
            accentColor="#ECB876"
          />
        </Box>
      </Paper>
    </Box>
  );
}
