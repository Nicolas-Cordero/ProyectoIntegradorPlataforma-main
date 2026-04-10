import { useEffect, useMemo, useState } from 'react';
import type { Estudiante } from '../../../../types';
import { ramosCursadosService, historialAcademicoService } from '../../../../services';

interface Semestre {
  año: number;
  semestre: number;
}

const defaultSemestre = (): Semestre => ({
  año: new Date().getFullYear(),
  semestre: 1,
});

const getSemestreFromRamo = (ramo: any, index: number): Semestre => {
  const periodo = ramo?.periodo_academico_estudiante?.periodo_academico;

  if (periodo?.año && periodo?.semestre) {
    return { año: Number(periodo.año), semestre: Number(periodo.semestre) };
  }

  if (ramo?.año && ramo?.semestre) {
    return { año: Number(ramo.año), semestre: Number(ramo.semestre) };
  }

  return asignarSemestreFallback(ramo?.nombre_ramo, index);
};

export const useSemesterOptions = (estudianteId?: number | string) => {
  const [semestresDisponibles, setSemestresDisponibles] = useState<Semestre[]>([]);
  const [semestreActual, setSemestreActual] = useState<Semestre>(defaultSemestre);
  const [loadingSemestres, setLoadingSemestres] = useState(false);

  useEffect(() => {
    const cargarSemestresDisponibles = async () => {
      if (!estudianteId) return;
      setLoadingSemestres(true);
      try {
        const todosLosRamos = await ramosCursadosService.getByEstudiante(estudianteId.toString());

        const semestresUnicos = new Map<string, Semestre>();
        todosLosRamos.forEach((ramo: any, index: number) => {
          const { año, semestre } = getSemestreFromRamo(ramo, index);
          semestresUnicos.set(`${año}-${semestre}`, { año, semestre });
        });

        if (semestresUnicos.size === 0) {
          const { año, semestre } = defaultSemestre();
          semestresUnicos.set(`${año}-${semestre}`, { año, semestre });
        }

        const semestres = Array.from(semestresUnicos.values())
          .sort((a, b) => {
            if (a.año !== b.año) return b.año - a.año;
            return b.semestre - a.semestre;
          });

        setSemestresDisponibles(semestres);
        if (semestres.length > 0) {
          setSemestreActual(semestres[0]);
        }
      } catch (error) {
        console.error('Error cargando semestres disponibles:', error);
      } finally {
        setLoadingSemestres(false);
      }
    };

    cargarSemestresDisponibles();
  }, [estudianteId]);

  return { semestresDisponibles, semestreActual, setSemestreActual, loadingSemestres };
};

const asignarSemestreFallback = (nombreRamo: string, index: number) => {
  const nombre = nombreRamo?.toLowerCase() || '';

  if (nombre.includes('calculo2') || nombre.includes('cálculo2') || nombre.includes('calculo 2')) {
    return { año: 2025, semestre: 1 };
  }
  if (nombre.includes('calculo3') || nombre.includes('cálculo3') || nombre.includes('calculo 3')) {
    return { año: 2025, semestre: 2 };
  }
  if (nombre.includes('calculo1') || nombre.includes('cálculo1') || nombre.includes('calculo 1')) {
    return { año: 2024, semestre: 2 };
  }
  if (nombre.includes('matemática') || nombre.includes('álgebra')) {
    return { año: 2024, semestre: 1 };
  }
  if (nombre.includes('física') || nombre.includes('química')) {
    return { año: 2024, semestre: 2 };
  }
  if (nombre.includes('programación') || nombre.includes('informática')) {
    return { año: 2025, semestre: 1 };
  }

  return { año: 2025, semestre: (index % 2) + 1 };
};

const filtrarHistorial = (historialResponse: any, semestreActual: Semestre) => {
  if (Array.isArray(historialResponse)) {
    return historialResponse.find(
      (h) => Number(h.año) === semestreActual.año && Number(h.semestre) === semestreActual.semestre
    ) || null;
  }

  if (
    historialResponse &&
    typeof historialResponse === 'object' &&
    Number((historialResponse as any).año) === semestreActual.año &&
    Number((historialResponse as any).semestre) === semestreActual.semestre
  ) {
    return historialResponse;
  }

  return null;
};

export const useSemesterPerformanceData = (
  estudiante: Estudiante,
  semestreActual: Semestre
) => {
  const [ramosSemestre, setRamosSemestre] = useState<any[]>([]);
  const [historialSemestre, setHistorialSemestre] = useState<any>(null);
  const [loadingDatos, setLoadingDatos] = useState(false);

  useEffect(() => {
    const cargarDatosSemestre = async () => {
      if (!estudiante.id_estudiante) return;

      // Construye una vista local de ramos con año/semestre normalizados para usar como fallback
      const obtenerRamosLocales = () => {
        const todosLosRamos = estudiante.ramosCursados || [];
        const ramosConSemestre = todosLosRamos.map((ramo: any, index: number) => {
          const { año, semestre } = getSemestreFromRamo(ramo, index);
          return { ...ramo, año, semestre };
        });

        const ramosLocales = ramosConSemestre.filter(
          (r) => Number(r.año) === semestreActual.año && Number(r.semestre) === semestreActual.semestre
        );

        return { ramosLocales, ramosConSemestre };
      };

      setLoadingDatos(true);
      try {
        // 1) Obtener ramos del backend (ya incluye periodo_academico_estudiante)
        const ramos = await ramosCursadosService.getByEstudiante(
          estudiante.id_estudiante.toString()
        );

        // 2) Normalizar año/semestre usando la relación de periodo académico
        const ramosNormalizados = (ramos || []).map((ramo: any, index: number) => {
          const { año, semestre } = getSemestreFromRamo(ramo, index);
          return { ...ramo, año, semestre };
        });

        const ramosFiltrados = (ramosNormalizados || []).filter((ramo) =>
          Number(ramo.año) === semestreActual.año && Number(ramo.semestre) === semestreActual.semestre
        );

        // Mostrar solo ramos del semestre seleccionado; si no hay, dejar vacío
        if (ramosFiltrados.length > 0) setRamosSemestre(ramosFiltrados);
        else setRamosSemestre([]);

        try {
          const historialResponse = await historialAcademicoService.getByEstudiante(
            estudiante.id_estudiante.toString()
          );
          setHistorialSemestre(filtrarHistorial(historialResponse, semestreActual));
        } catch (historialError) {
          console.log('No hay historial guardado para este semestre');
          setHistorialSemestre(null);
        }
      } catch (error) {
        console.error('Error cargando datos del semestre:', error);

        const { ramosLocales } = obtenerRamosLocales();
        setRamosSemestre(ramosLocales);
        setHistorialSemestre(null);
      } finally {
        setLoadingDatos(false);
      }
    };

    cargarDatosSemestre();
  }, [estudiante.id_estudiante, estudiante.ramosCursados, semestreActual]);

  return { ramosSemestre, historialSemestre, loadingDatos };
};

export const useSemesterStats = (ramosSemestre: any[], historialSemestre: any) => {
  return useMemo(() => {
    // Stats basados en ramos visibles (fuente primaria)
    const totalRamos = ramosSemestre.length;
    const aprobadosR = ramosSemestre.filter((r) => r.estado === 'aprobado' || r.estado === 'A').length;
    const reprobadosR = ramosSemestre.filter((r) => r.estado === 'reprobado' || r.estado === 'R').length;
    const eliminadosR = ramosSemestre.filter((r) => r.estado === 'eliminado' || r.estado === 'E').length;

    const notas = ramosSemestre
      .map((r) => Number(r.promedio_final))
      .filter((n) => Number.isFinite(n));

    const promedioRamos = notas.length > 0
      ? notas.reduce((sum, n) => sum + n, 0) / notas.length
      : null;

    // Si hay historial, usarlo solo cuando tenga datos; de lo contrario, fallback a cálculo por ramos
    if (historialSemestre) {
      const aprobadosH = Number(historialSemestre.ramos_aprobados) || 0;
      const reprobadosH = Number(historialSemestre.ramos_reprobados) || 0;
      const eliminadosH = Number(historialSemestre.ramos_eliminados) || 0;
      const totalH = aprobadosH + reprobadosH + eliminadosH;
      const promedioHist = Number(historialSemestre.promedio_semestre);

      const total = totalH > 0 ? totalH : totalRamos;
      const aprobados = totalH > 0 ? aprobadosH : aprobadosR;
      const reprobados = totalH > 0 ? reprobadosH : reprobadosR;
      const eliminados = totalH > 0 ? eliminadosH : eliminadosR;

      // Si el historial trae promedio en 0 o null, usa el calculado por ramos
      const promedio = Number.isFinite(promedioHist) && promedioHist > 0
        ? promedioHist
        : promedioRamos;

      return { total, aprobados, reprobados, eliminados, promedio };
    }

    const promedio = Number.isFinite(promedioRamos as number)
      ? Number(promedioRamos)
      : null;

    return { total: totalRamos, aprobados: aprobadosR, reprobados: reprobadosR, eliminados: eliminadosR, promedio };
  }, [ramosSemestre, historialSemestre]);
};
