/**
 * Sección de entrevistas
 * Lista de entrevistas con botón para agregar nueva
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Chip, Stack, CircularProgress } from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon, Edit as EditIcon, Article as ArticleIcon } from '@mui/icons-material';
import { NuevaEntrevistaModal } from './components';
import { EntrevistaReportGenerator } from '../../EntrevistaReportGenerator';
import { entrevistaService } from '../../../services';
import type { Entrevista } from '../../../types';

interface InterviewsSectionProps {
  estudianteId: string | number;
  estudiante?: any;
}

export function InterviewsSection({ estudianteId, estudiante }: InterviewsSectionProps) {
  const navigate = useNavigate();
  const [mostrarModalNuevaEntrevista, setMostrarModalNuevaEntrevista] = useState(false);
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicion, setTextoEdicion] = useState('');
  const [textoInfoAdicional, setTextoInfoAdicional] = useState('');

  // Cargar entrevistas del backend
  useEffect(() => {
    const loadEntrevistas = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await entrevistaService.getByEstudiante(estudianteId.toString());
        const entrevistasSeguras = Array.isArray(data) ? data : [];
        setEntrevistas(entrevistasSeguras);
      } catch (err) {
        console.error('Error al cargar entrevistas:', err);
        setError('Error al cargar las entrevistas');
        setEntrevistas([]);
      } finally {
        setLoading(false);
      }
    };

    if (estudianteId) {
      loadEntrevistas();
    }
  }, [estudianteId]);

  const handleEditarEntrevista = (entrevista: Entrevista) => {
    if (!entrevista.id) {
      console.error('ID de entrevista inválido');
      return;
    }
    navigate(`/entrevista/${entrevista.id}`);
  };

  const handleIniciarEdicionComentario = (entrevista: Entrevista) => {
    setEditandoId(entrevista.id);
    setTextoEdicion(entrevista.observaciones || '');
    setTextoInfoAdicional(entrevista.informacion_adicional || '');
  };

  const handleGuardarComentario = async (entrevista: Entrevista) => {
    try {
      await entrevistaService.update(entrevista.id, {
        observaciones: textoEdicion,
        informacion_adicional: textoInfoAdicional,
      });
      setEntrevistas((prev) => prev.map((e) => (e.id === entrevista.id ? { ...e, observaciones: textoEdicion, informacion_adicional: textoInfoAdicional } : e)));
      setEditandoId(null);
      setTextoEdicion('');
      setTextoInfoAdicional('');
    } catch (err) {
      console.error('Error guardando comentario', err);
      alert('No se pudo guardar el comentario');
    }
  };

  const handleEliminarComentario = async (entrevista: Entrevista) => {
    if (!window.confirm('¿Eliminar solo el comentario? La entrevista se mantendrá.')) return;
    try {
      await entrevistaService.update(entrevista.id, { observaciones: '' });
      setEntrevistas((prev) => prev.map((e) => (e.id === entrevista.id ? { ...e, observaciones: '' } : e)));
    } catch (err) {
      console.error('Error eliminando comentario', err);
      alert('No se pudo eliminar el comentario');
    }
  };

  const handleEliminarEntrevista = async (entrevista: Entrevista) => {
    if (!window.confirm('¿Eliminar la entrevista y todos sus comentarios?')) return;
    try {
      await entrevistaService.delete(entrevista.id);
      setEntrevistas((prev) => prev.filter((e) => e.id !== entrevista.id));
    } catch (err) {
      console.error('Error eliminando entrevista', err);
      alert('No se pudo eliminar la entrevista');
    }
  };

  // Agrupar por fecha (solo día) y ordenar desc
  const entrevistasOrdenadas = (Array.isArray(entrevistas) ? [...entrevistas] : []).sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  // Generar entrevista consolidada con datos reales
  const detalleEntrevistas = entrevistasOrdenadas.map((ent) => ({
    fecha: ent.fecha,
    numero_entrevista: (ent as any).numero_entrevista ?? (ent as any).numero_Entrevista,
    estado: ent.estado,
    duracion_minutos: (ent as any).duracion_minutos,
    observaciones: ent.observaciones || 'Sin observaciones',
    informacion_adicional: ent.informacion_adicional || 'Sin información adicional',
    temas_abordados: ent.temas_abordados,
  }));

  const entrevistaConsolidada = {
    id: 'consolidado',
    fecha: new Date(),
    estudiante: estudiante || {
      nombre: 'Estudiante',
      apellido_paterno: '',
      apellido_materno: '',
      rut: '',
      email: '',
      telefono: '',
      fecha_nacimiento: '',
      genero: '',
      direccion: '',
      id: '',
      created_at: new Date(),
      updated_at: new Date()
    },
    tutor: 'Reporte Consolidado',
    temas_abordados: `Resumen de ${entrevistas.length} entrevistas realizadas`,
    observaciones: `Este documento contiene el historial completo de entrevistas del estudiante.`,
    etiquetas: entrevistas.flatMap((ent) => Array.isArray(ent.etiquetas) ? ent.etiquetas : []),
    textos: entrevistas.flatMap((ent) => Array.isArray(ent.textos) ? ent.textos : []),
    detalleEntrevistas,
    created_at: new Date(),
    updated_at: new Date()
  };

  // Agrupar por fecha local (string dd/mm/aaaa) para asegurar una sola tarjeta por día
  const entrevistasPorFecha = entrevistasOrdenadas.reduce<Record<string, Entrevista[]>>((acc, ent) => {
    const fecha = new Date(ent.fecha);
    const fechaKey = fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    acc[fechaKey] = acc[fechaKey] ? [...acc[fechaKey], ent] : [ent];
    return acc;
  }, {});

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Error al cargar entrevistas
        </Typography>
        <Typography color="text.secondary">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Entrevistas
        </Typography>
        <Stack direction="row" spacing={2}>
          {entrevistas.length > 0 && (
            <EntrevistaReportGenerator entrevista={entrevistaConsolidada} />
          )}
          <Button 
            startIcon={<AddIcon />}
            onClick={() => setMostrarModalNuevaEntrevista(true)}
            variant="contained"
            color="primary"
            size="large"
          >
            Nueva Entrevista
          </Button>
        </Stack>
      </Box>

      <Stack spacing={2}>
        {Object.entries(entrevistasPorFecha)
          .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
          .map(([fechaKey, entrevistasDia]) => (
          <Paper key={fechaKey} elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              {fechaKey}
            </Typography>
            <Stack spacing={1} divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'grey.200' }} />}> 
              {entrevistasDia.map((entrevista) => {
                const fechaObj = new Date(entrevista.fecha);
                const hora = fechaObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });

                return (
                  <Box key={entrevista.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Chip label={hora} size="small" color="primary" variant="outlined" sx={{ mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {entrevista.informacion_adicional?.trim() ? 'Información' : 'Entrevista'}
                        </Typography>
                        <Chip 
                          label={entrevista.estado || 'Completada'} 
                          color={entrevista.estado === 'completada' ? 'success' : 'primary'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>

                        {editandoId === entrevista.id ? (
                          <Box sx={{ mt: 0.25, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Información
                            </Typography>
                            <textarea
                              value={textoInfoAdicional}
                              onChange={(e) => setTextoInfoAdicional(e.target.value)}
                              rows={3}
                              placeholder="Información"
                              style={{ width: '100%', resize: 'vertical', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Observaciones
                            </Typography>
                            <textarea
                              value={textoEdicion}
                              onChange={(e) => setTextoEdicion(e.target.value)}
                              rows={3}
                              placeholder="Observaciones"
                              style={{ width: '100%', resize: 'vertical', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                          </Box>
                        ) : (
                          <Box sx={{ mt: 0.25, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Información
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {entrevista.informacion_adicional?.trim() || 'Sin información'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Observaciones
                            </Typography>
                            <Typography variant="body2" color="text.primary">
                              {entrevista.observaciones || 'Sin observaciones'}
                            </Typography>
                          </Box>
                        )}

                      {entrevista.temas_abordados && entrevista.temas_abordados.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                          Temas: {entrevista.temas_abordados.join(', ')}
                        </Typography>
                      )}

                      <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button 
                          startIcon={<VisibilityIcon />}
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditarEntrevista(entrevista)}
                        >
                          Ver Detalle
                        </Button>
                        {editandoId === entrevista.id ? (
                          <>
                            <Button 
                              startIcon={<EditIcon />}
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleGuardarComentario(entrevista)}
                            >
                              Guardar
                            </Button>
                            <Button 
                              variant="outlined"
                              color="inherit"
                              size="small"
                              onClick={() => { setEditandoId(null); setTextoEdicion(''); }}
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <Button 
                            startIcon={<EditIcon />}
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => handleIniciarEdicionComentario(entrevista)}
                          >
                            Editar comentario
                          </Button>
                        )}
                        <Button 
                          variant="outlined"
                          color="warning"
                          size="small"
                          onClick={() => handleEliminarComentario(entrevista)}
                        >
                          Eliminar comentario
                        </Button>
                        <Button 
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleEliminarEntrevista(entrevista)}
                        >
                          Eliminar entrevista
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        ))}
      </Stack>

      {entrevistas.length === 0 && (
        <Paper elevation={2} sx={{ p: 8, borderRadius: 2, textAlign: 'center' }}>
          <ArticleIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            No hay entrevistas registradas
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Comienza agregando la primera entrevista del estudiante.
          </Typography>
          <Button 
            startIcon={<AddIcon />}
            onClick={() => setMostrarModalNuevaEntrevista(true)}
            variant="contained"
            size="large"
          >
            Agregar Primera Entrevista
          </Button>
        </Paper>
      )}

      {/* Modal para crear nueva entrevista */}
      <NuevaEntrevistaModal
        open={mostrarModalNuevaEntrevista}
        onClose={() => setMostrarModalNuevaEntrevista(false)}
        estudianteId={estudianteId}
      />
    </Box>
  );
}
