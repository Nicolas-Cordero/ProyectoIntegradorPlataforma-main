/**
 * Utilidad para obtener colores consistentes según el estado del estudiante
 * Centraliza la lógica de colores para evitar duplicación
 */

export type EstadoEstudiante = 'Activo' | 'Egresado' | 'Suspendido' | 'Desertor' | 'Congelado';

/**
 * Obtiene el color de fondo correspondiente al estado de un estudiante
 * @param estado - Estado actual del estudiante
 * @returns Color hexadecimal para el estado
 */
export const getEstadoColor = (estado: string): string => {
  switch (estado) {
    case 'Activo':
      return '#4CAF50'; // Verde
    case 'Egresado':
      return '#2196F3'; // Azul
    case 'Suspendido':
      return '#FF9800'; // Naranja
    case 'Desertor':
      return '#f44336'; // Rojo
    case 'Congelado':
      return '#9E9E9E'; // Gris
    default:
      return '#757575'; // Gris por defecto
  }
};

/**
 * Obtiene las clases de Tailwind CSS correspondientes al estado
 * @param estado - Estado actual del estudiante
 * @returns String con clases de Tailwind para el badge
 */
export const getEstadoClasses = (estado: string): string => {
  switch (estado) {
    case 'Activo':
      return 'bg-green-500 text-white';
    case 'Egresado':
      return 'bg-blue-500 text-white';
    case 'Suspendido':
      return 'bg-orange-500 text-white';
    case 'Desertor':
      return 'bg-red-500 text-white';
    case 'Congelado':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
};
