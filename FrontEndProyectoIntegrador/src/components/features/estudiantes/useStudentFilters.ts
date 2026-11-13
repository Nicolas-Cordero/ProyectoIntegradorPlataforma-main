import { useEffect, useMemo, useState } from 'react';
import type { EstadoEstudiante, Estudiante } from '../../../types';
import { carrerasVisibles } from './carrerasVisibles';

export type FiltroAlertas = 'todas' | 'con' | 'sin';

export interface StudentFiltersValue {
  busqueda: string;
  alertas: FiltroAlertas;
  institucion: string;
  estado: EstadoEstudiante | '';
}

const FILTROS_INICIALES: StudentFiltersValue = {
  busqueda: '',
  alertas: 'todas',
  institucion: '',
  estado: '',
};

const DEBOUNCE_BUSQUEDA_MS = 200;

// Estado y lógica de la barra de filtros de estudiantes (StudentFilters),
// compartida por la sección Estudiantes y la vista de Generación.
export function useStudentFilters<T extends Estudiante>(students: T[], alertasRuts: string[]) {
  const [filtros, setFiltros] = useState<StudentFiltersValue>(FILTROS_INICIALES);
  const [termino, setTermino] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setTermino(filtros.busqueda.trim().toLowerCase()), DEBOUNCE_BUSQUEDA_MS);
    return () => clearTimeout(t);
  }, [filtros.busqueda]);

  const setFiltro = <K extends keyof StudentFiltersValue>(campo: K, valor: StudentFiltersValue[K]) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const limpiar = () => {
    setFiltros(FILTROS_INICIALES);
    setTermino('');
  };

  const institucionOptions = useMemo(() => {
    const nombres = students.flatMap((s) =>
      carrerasVisibles(s).map((c) => c.universidad?.nombre).filter((n): n is string => Boolean(n))
    );
    return [...new Set(nombres)].sort((a, b) => a.localeCompare(b, 'es'));
  }, [students]);

  const filtrados = useMemo(() => {
    const alertasSet = new Set(alertasRuts);
    return students.filter((s) => {
      if (termino) {
        const nombre = `${s.nombre || ''} ${s.apellido || ''}`.toLowerCase();
        const rut = (s.rut_estudiante || '').toLowerCase();
        if (!nombre.includes(termino) && !rut.includes(termino)) return false;
      }
      if (filtros.alertas !== 'todas') {
        const tieneAlerta = alertasSet.has(s.rut_estudiante);
        if (filtros.alertas === 'con' ? !tieneAlerta : tieneAlerta) return false;
      }
      if (filtros.institucion &&
          !carrerasVisibles(s).some((c) => c.universidad?.nombre === filtros.institucion)) {
        return false;
      }
      if (filtros.estado && s.estado !== filtros.estado) return false;
      return true;
    });
  }, [students, alertasRuts, termino, filtros.alertas, filtros.institucion, filtros.estado]);

  const hayFiltrosActivos =
    !!filtros.busqueda || filtros.alertas !== 'todas' || !!filtros.institucion || !!filtros.estado;

  return { filtros, setFiltro, limpiar, institucionOptions, filtrados, hayFiltrosActivos };
}
