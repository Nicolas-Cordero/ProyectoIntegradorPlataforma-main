import { useStudentData } from './useStudentData';
import { useStudentEditing } from './useStudentEditing';
import { useStudentPermissions } from './useStudentPermissions';
import { useStudentSemesters } from './useStudentSemesters';
import { useStudentInterviews } from './useStudentInterviews';

/**
 * Hook principal que combina toda la lógica del detalle del estudiante
 */
export const useStudentDetail = () => {
  // Cargar datos del estudiante
  const studentData = useStudentData();

  // Gestionar permisos y navegación
  const permissions = useStudentPermissions();

  // Gestionar semestres
  const semesters = useStudentSemesters({
    id: studentData.id,
    estudiante: studentData.estudiante,
    setInformesGuardados: studentData.setInformesGuardados
  });

  // Gestionar edición (incluye cambios externos de semestres/ramos)
  const editing = useStudentEditing({
    id: studentData.id,
    estudiante: studentData.estudiante,
    reloadStudentData: studentData.reloadStudentData,
    setInformesGuardados: studentData.setInformesGuardados,
    hayCambiosExternos: semesters.hayCambiosSemestre,
    limpiarCambiosExternos: semesters.limpiarCambiosSemestre
  });

  // Gestionar entrevistas
  const interviews = useStudentInterviews();

  // Combinar datos del estudiante con ediciones temporales
  // Calcular directamente en cada render para asegurar actualización
  const estudianteConEdiciones = editing.getDatosCombinadosParaVista();

  return {
    // Datos del estudiante
    ...studentData,
    
    // Permisos y navegación
    ...permissions,
    
    // Edición
    ...editing,
    
    // Semestres
    ...semesters,
    
    // Entrevistas
    ...interviews,
    
    // Datos combinados
    estudianteConEdiciones
  };
};