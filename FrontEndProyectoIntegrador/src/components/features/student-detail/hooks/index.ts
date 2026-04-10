// Hook principal
export { useStudentDetail } from './useStudentDetail';

// Hooks individuales para casos específicos
export { useStudentData } from './useStudentData';
export { useStudentEditing } from './useStudentEditing';
export { useStudentPermissions } from './useStudentPermissions';
export { useStudentSemesters } from './useStudentSemesters';
export { useStudentInterviews } from './useStudentInterviews';

// Hooks especializados de edición (por dominio)
export { useEstudianteEditing } from './useEstudianteEditing';
export { useFamiliaEditing } from './useFamiliaEditing';
export { useAcademicEditing } from './useAcademicEditing';
export { useAutosave } from './useAutosave';

// Tipos compartidos
export type { SeccionActiva } from '../index';