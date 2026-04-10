/**
 * Utilidades para formateo y manipulación de fechas
 */

/**
 * Formatea una fecha ISO a formato chileno (dd/mm/yyyy)
 * @param isoDate - Fecha en formato ISO string
 * @returns Fecha formateada o texto alternativo
 */
export const formatDateChilean = (isoDate: string | undefined | null): string => {
  if (!isoDate) return 'Sin registro';
  
  try {
    return new Date(isoDate).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Calcula días transcurridos desde una fecha
 * @param isoDate - Fecha inicial en formato ISO
 * @returns Número de días transcurridos
 */
export const daysSince = (isoDate: string): number => {
  const date = new Date(isoDate);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/**
 * Formatea una fecha de forma relativa (hace X días)
 * @param isoDate - Fecha en formato ISO
 * @returns String descriptivo relativo
 */
export const formatRelativeDate = (isoDate: string): string => {
  const days = daysSince(isoDate);
  
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Hace 1 día';
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }
  
  const years = Math.floor(days / 365);
  return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
};
