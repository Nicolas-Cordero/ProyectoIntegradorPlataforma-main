import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// TODO: migrate ToggleButtonGroup, ToggleButton
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { School as SchoolIcon, ArrowUpward, ArrowDownward, Add as AddIcon } from '@mui/icons-material';
import { estudianteService } from '../services';
import { logger } from '../config';
import { Spinner, ErrorMessage, Alert } from '../components/ui';
import { GradientButton } from '../components/common/GradientButton';
import { CreateGeneracionModal } from '../components/features/generaciones';
import type { Generacion } from '../types';

const ICON_COLORS = ['#65B39B', '#C7654F', '#ECB876', '#D3C483', '#8FD4BB', '#E89080'];

export const GeneracionesPanel: React.FC = () => {
  const navigate = useNavigate();

  const [generaciones, setGeneraciones] = useState<Generacion[]>([]);
  const [orden, setOrden] = useState<'desc' | 'asc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await estudianteService.getGenerations();
      setGeneraciones(data);
    } catch (err) {
      logger.error('Error al cargar generaciones:', err);
      setError('No se pudo cargar la información de generaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGeneracionCreada = (nueva: Generacion) => {
    setGeneraciones((prev) => [...prev, nueva]);
    setSuccessMsg(`Generación ${nueva.año} creada exitosamente.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const generacionesOrdenadas = [...generaciones].sort((a, b) =>
    orden === 'desc' ? b.año - a.año : a.año - b.año
  );

  if (loading) return <Spinner fullScreen message="Cargando generaciones..." />;
  if (error) return <ErrorMessage fullScreen message={error} onRetry={fetchData} />;

  return (
    <div className="min-h-screen bg-[#FFFBF0] py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header con gradiente */}
        <div
          className="rounded-2xl p-6 md:p-10 mb-8 text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #65B39B 0%, #4a9e87 40%, #C7654F 100%)',
            boxShadow: '0 8px 32px rgba(101, 179, 155, 0.35)',
          }}
        >
          <div className="absolute -top-10 -right-10 w-[180px] h-[180px] rounded-full bg-white/[0.08] pointer-events-none" />
          <div className="absolute -bottom-[50px] right-20 w-[130px] h-[130px] rounded-full bg-white/[0.06] pointer-events-none" />
          <div className="absolute top-5 right-[120px] w-[60px] h-[60px] rounded-full bg-white/10 pointer-events-none" />

          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-5">
              <div className="bg-white/20 rounded-xl p-3 flex items-center justify-center backdrop-blur-sm">
                <SchoolIcon style={{ fontSize: 40 }} />
              </div>
              <div>
                <h4 className="text-[2.125rem] font-bold leading-tight">Generaciones</h4>
                <p className="text-base opacity-85 mt-1">
                  {generacionesOrdenadas.length} generación{generacionesOrdenadas.length !== 1 ? 'es' : ''} registrada{generacionesOrdenadas.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpenModal(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 border border-white/30 hover:border-white/50"
            >
              <AddIcon fontSize="small" />
              Agregar Generación
            </button>
          </div>
        </div>

        {/* Feedback de éxito */}
        {successMsg && (
          <Alert
            tipo="exito"
            mensaje={successMsg}
            cerrable
            onCerrar={() => setSuccessMsg(null)}
          />
        )}

        {/* Controles de orden */}
        {/* TODO: migrate ToggleButtonGroup, ToggleButton */}
        <div
          className="rounded-xl bg-white mb-6 px-6 py-4 flex items-center gap-4"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <span className="text-sm text-gray-500 font-medium">Ordenar por año:</span>
          <ToggleButtonGroup
            size="small"
            value={orden}
            exclusive
            onChange={(_, value) => { if (value) setOrden(value); }}
          >
            <ToggleButton value="desc">
              <ArrowDownward fontSize="small" sx={{ mr: 0.5 }} /> Mayor a menor
            </ToggleButton>
            <ToggleButton value="asc">
              <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} /> Menor a mayor
            </ToggleButton>
          </ToggleButtonGroup>
        </div>

        {/* Estado vacío */}
        {generacionesOrdenadas.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No hay generaciones registradas</h3>
            <p className="text-gray-500 mb-6">Crea la primera generación para comenzar.</p>
            <button
              onClick={() => setOpenModal(true)}
              className="inline-flex items-center gap-2 bg-[#65B39B] hover:bg-[#4a9e87] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              <AddIcon fontSize="small" />
              Agregar Generación
            </button>
          </div>
        )}

        {/* Grid de tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {generacionesOrdenadas.map((gen, index) => {
            const color = ICON_COLORS[index % ICON_COLORS.length];
            return (
              <div
                key={gen.id}
                className="rounded-xl bg-white border border-gray-200 transition-all duration-[250ms] ease-in-out hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="p-6 flex flex-col gap-5">
                  <div
                    className="h-1.5 rounded-lg -mx-1 -mt-1"
                    style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
                  />

                  <div className="flex items-center gap-4">
                    <div
                      className="rounded-xl p-3 flex items-center justify-center"
                      style={{ backgroundColor: `${color}18` }}
                    >
                      <SchoolIcon style={{ fontSize: 32, color }} />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Generación</span>
                      <p className="text-2xl font-bold leading-tight">{gen.año}</p>
                      {gen.descripcion && (
                        <span className="text-xs text-gray-500">{gen.descripcion}</span>
                      )}
                    </div>
                  </div>

                  <GradientButton
                    fullWidth
                    solidColor={color}
                    sx={{ minHeight: 44, borderRadius: 2 }}
                    onClick={() => navigate(`/generacion/${gen.id}`)}
                  >
                    Ver Generación
                  </GradientButton>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <CreateGeneracionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={handleGeneracionCreada}
      />
    </div>
  );
};
