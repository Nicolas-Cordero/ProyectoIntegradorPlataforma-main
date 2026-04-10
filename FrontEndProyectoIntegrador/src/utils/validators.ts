/**
 * Funciones de validación reutilizables
 */

/**
 * Valida formato de email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida formato de RUT chileno (básico)
 */
export const isValidRut = (rut: string): boolean => {
  // Formato: XX.XXX.XXX-X
  const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
  return rutRegex.test(rut);
};

/**
 * Valida que un string no esté vacío (después de trim)
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Valida rango de promedio académico
 */
export const isValidPromedio = (promedio: number): boolean => {
  return promedio >= 1.0 && promedio <= 7.0;
};
