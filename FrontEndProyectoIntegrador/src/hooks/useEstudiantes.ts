import { useState, useEffect, useCallback } from 'react';
import { estudianteService } from '../services';
import { logger } from '../config';
import type { Estudiante } from '../types';

interface UseEstudiantesParams {
  generacionId?: string;
  autoFetch?: boolean;
}

interface UseEstudiantesReturn {
  estudiantes: Estudiante[];
  loading: boolean;
  error: string | null;
  fetchEstudiantes: () => Promise<void>;
  getEstudianteById: (id: string) => Estudiante | undefined;
  filtrarPorEstado: (estado: string) => Estudiante[];
  refresh: () => void;
}

/**
 * Hook para gestionar estudiantes
 * @param params - Configuración del hook
 * @param params.generacionId - ID de generación para filtrar estudiantes
 * @param params.autoFetch - Si debe cargar automáticamente al montar (default: true)
 * @returns Objeto con estudiantes, estados y métodos de gestión
 * 
 * @example
 * ```tsx
 * const { estudiantes, loading, error, refresh } = useEstudiantes({ generacionId: '2023' });
 * 
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} onRetry={refresh} />;
 * ```
 */
export const useEstudiantes = (params: UseEstudiantesParams = {}): UseEstudiantesReturn => {
  const { generacionId, autoFetch = true } = params;
  
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstudiantes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.log('📚 Cargando estudiantes', generacionId ? `de generación ${generacionId}` : '');
      
      let data: Estudiante[];
      if (generacionId) {
        data = await estudianteService.getByGeneracion(generacionId);
      } else {
        data = await estudianteService.getAll();
      }
      
      setEstudiantes(data);
      logger.log('✅ Estudiantes cargados:', data.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar estudiantes';
      logger.error('❌ Error cargando estudiantes:', errorMessage);
      setError(errorMessage);
      setEstudiantes([]);
    } finally {
      setLoading(false);
    }
  }, [generacionId]);

  useEffect(() => {
    if (autoFetch) {
      fetchEstudiantes();
    }
  }, [autoFetch, fetchEstudiantes]);

  const getEstudianteById = useCallback((id: string | number): Estudiante | undefined => {
    return estudiantes.find(est => 
      String(est.id_estudiante) === String(id) || String(est.id) === String(id)
    );
  }, [estudiantes]);

  const filtrarPorEstado = useCallback((estado: string): Estudiante[] => {
    return estudiantes.filter(est => est.estado === estado);
  }, [estudiantes]);

  const refresh = useCallback(() => {
    fetchEstudiantes();
  }, [fetchEstudiantes]);

  return {
    estudiantes,
    loading,
    error,
    fetchEstudiantes,
    getEstudianteById,
    filtrarPorEstado,
    refresh,
  };
};
