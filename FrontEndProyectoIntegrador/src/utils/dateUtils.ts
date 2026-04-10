/**
 * Utilidades para formateo de fechas
 */

/**
 * Formatea una fecha a formato local chileno (DD/MM/YYYY)
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('es-CL');
  } catch {
    return '-';
  }
}

/**
 * Formatea una fecha con formato largo (ej: "15 de marzo de 2024")
 */
export function formatDateLong(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('es-CL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return '-';
  }
}

/**
 * Convierte fecha a formato ISO para inputs HTML (YYYY-MM-DD)
 */
export function toInputDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * Calcula la diferencia en días entre dos fechas
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

/**
 * Verifica si una fecha es válida
 */
export function isValidDate(date: unknown): boolean {
  if (!date) return false;
  const d = new Date(date as string | Date);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Obtiene el año actual
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Formatea fecha y hora (DD/MM/YYYY HH:MM)
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    const d = new Date(date);
    return `${d.toLocaleDateString('es-CL')} ${d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return '-';
  }
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 */
export function calculateAge(birthDate: string | Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}
