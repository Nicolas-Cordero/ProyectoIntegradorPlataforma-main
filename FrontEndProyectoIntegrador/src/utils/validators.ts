/**
 * Funciones de validación y normalización reutilizables
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

// ── Normalizadores de entrada ─────────────────────────────────────────────────

/**
 * Normaliza un RUT chileno al formato canónico XXXXXXXX-K (sin puntos, con guion).
 * Acepta cualquier variante: con/sin puntos, con/sin guion, con/sin espacios.
 * Ejemplos aceptados: "12345678-9", "12.345.678-9", "123456789", "12 345 678-9"
 * El backend espera /^\d{7,8}-[\dkK]$/, por eso no se agregan puntos.
 */
export function normalizarRut(raw: string): string {
  // Eliminar puntos y espacios; pasar a mayúsculas (para la K del dígito verificador)
  let clean = raw.replace(/\./g, '').replace(/\s/g, '').toUpperCase();
  // Si no tiene guion, insertar uno antes del último carácter
  if (!clean.includes('-') && clean.length >= 2) {
    clean = `${clean.slice(0, -1)}-${clean.slice(-1)}`;
  }
  return clean;
}

/**
 * Normaliza un número de teléfono móvil chileno al formato canónico +569 XXXX XXXX.
 * Acepta: con/sin +56, con/sin espacios, con/sin prefijo de red (9).
 * Ejemplos aceptados: "912345678", "56912345678", "+56912345678", "+569 1234 5678", "9 1234 5678"
 * Si no puede normalizar (ej. número inválido), devuelve el valor original sin modificar.
 */
export function normalizarTelefono(raw: string): string {
  // Extraer solo dígitos
  let digits = raw.replace(/\D/g, '');
  // Quitar código de país 56 si está presente (resultado esperado: 9 dígitos)
  if (digits.startsWith('56') && digits.length >= 11) {
    digits = digits.slice(2);
  }
  // Número móvil chileno: 9 dígitos que empiezan con 9
  if (digits.length === 9 && digits.startsWith('9')) {
    return `+569 ${digits.slice(1, 5)} ${digits.slice(5)}`;
  }
  return raw.trim();
}

/**
 * Devuelve true si el teléfono puede normalizarse a un móvil chileno válido.
 * Admite las mismas variantes que normalizarTelefono.
 */
export function esTelefonoValido(raw: string): boolean {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('56') && digits.length >= 11) digits = digits.slice(2);
  return digits.length === 9 && digits.startsWith('9');
}
