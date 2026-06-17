/**
 * Devuelve el cuerpo del RUT (sin dígito verificador).
 * Ej: "12345678-9" → "12345678". Si no trae guion, se devuelve tal cual.
 * Se usa como contraseña inicial unificada para todo usuario creado.
 */
export function rutSinDV(rut: string): string {
  const [cuerpo] = rut.split('-');
  return cuerpo.trim();
}
