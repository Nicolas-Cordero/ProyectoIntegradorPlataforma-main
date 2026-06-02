/**
 * Custom hook para gestionar datos de generaciones
 * Centraliza cálculos y estadísticas de generaciones de estudiantes
 */
import { useState, useEffect, useMemo } from 'react';
import { estudianteService } from '../services';
import { logger } from '../config';
import type { Estudiante } from '../types';

interface Generacion {
  id: string;
  año: string;
  totalEstudiantes: number;
  activos: number;
  egresados: number;
  suspendidos: number;
  desertores: number;
  congelados: number;
}

interface UseGeneracionesReturn {
  generaciones: Generacion[];
  loading: boolean;
  error: string | null;
  totalGeneraciones: number;
  totalEstudiantes: number;
  estudiantesActivos: number;
  getGeneracionById: (id: string) => Generacion | undefined;
  refresh: () => void;
}

/**
 * Hook para gestionar generaciones y sus estadísticas
 * Calcula automáticamente totales y distribución por estado
 * 
 * @returns Objeto con generaciones, estadísticas y métodos de gestión
 * 
 * @example
 * ```tsx
 * const { generaciones, totalEstudiantes, estudiantesActivos, loading } = useGeneraciones();
 * 
 * return (
 *   <div>
 *     <StatCard icon="chart" label="Total Estudiantes" value={totalEstudiantes} />
 *     <StatCard icon="check" label="Activos" value={estudiantesActivos} />
 *   </div>
 * );
 * ```
 */
export const useGeneraciones = (): UseGeneracionesReturn => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.log('📚 Cargando datos de generaciones');
      const data = await estudianteService.getAll();
      setEstudiantes(data);
      logger.log('✅ Datos cargados:', data.length, 'estudiantes');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar generaciones';
      logger.error('❌ Error cargando generaciones:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calcular generaciones agrupadas por año
  const generaciones = useMemo((): Generacion[] => {
    const generacionesMap = new Map<string, Generacion>();

    estudiantes.forEach(estudiante => {
      const año = estudiante.generacion || 'Sin generación';
      
      if (!generacionesMap.has(año)) {
        generacionesMap.set(año, {
          id: año,
          año,
          totalEstudiantes: 0,
          activos: 0,
          egresados: 0,
          suspendidos: 0,
          desertores: 0,
          congelados: 0,
        });
      }

      const gen = generacionesMap.get(año)!;
      gen.totalEstudiantes++;

      const estado = estudiante.estado || 'ACTIVO';
      switch (estado) {
        case 'ACTIVO':
          gen.activos++;
          break;
        case 'EGRESADO':
        case 'TITULADO':
          gen.egresados++;
          break;
        case 'SUSPENDIDO':
          gen.suspendidos++;
          break;
        case 'RETIRADO':
          gen.desertores++;
          break;
        case 'ELIMINADO':
        case 'CONDICIONAL':
          gen.congelados++;
          break;
      }
    });

    return Array.from(generacionesMap.values()).sort((a, b) => b.año.localeCompare(a.año));
  }, [estudiantes]);

  // Estadísticas globales
  const totalGeneraciones = generaciones.length;
  const totalEstudiantes = estudiantes.length;
  const estudiantesActivos = estudiantes.filter(e => e.estado === 'ACTIVO').length;

  const getGeneracionById = (id: string): Generacion | undefined => {
    return generaciones.find(gen => gen.id === id);
  };

  const refresh = () => {
    fetchData();
  };

  return {
    generaciones,
    loading,
    error,
    totalGeneraciones,
    totalEstudiantes,
    estudiantesActivos,
    getGeneracionById,
    refresh,
  };
};
