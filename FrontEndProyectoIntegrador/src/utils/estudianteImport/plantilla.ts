import * as XLSX from 'xlsx';

/**
 * Columnas de la plantilla de importación de estudiantes, en orden.
 * Deben coincidir EXACTAMENTE (ni más ni menos) con lo que el parser espera y
 * con los campos obligatorios de CreateEstudianteDto.
 */
export const COLUMNAS_PLANTILLA = [
  'rut_estudiante',
  'nombre',
  'apellido',
  'email',
  'telefono',
  'fecha_nacimiento',
  'direccion',
  'genero',
  'rbd_liceo',
  'promedios_media',
] as const;

export type ColumnaPlantilla = (typeof COLUMNAS_PLANTILLA)[number];

// Fila de ejemplo (fila 2 de la plantilla).
const FILA_EJEMPLO: Record<ColumnaPlantilla, string> = {
  rut_estudiante: '12.345.678-5',
  nombre: 'Juan',
  apellido: 'Pérez González',
  email: 'juan@correo.com',
  telefono: '+569 1234 5678',
  fecha_nacimiento: '15/03/2000',
  direccion: 'Av. Ejemplo 123',
  genero: 'MASCULINO',
  rbd_liceo: '12345',
  promedios_media: '6.0',
};

// Fila con una breve descripción del formato aceptado (fila 3 de la plantilla).
const FILA_DESCRIPCION: Record<ColumnaPlantilla, string> = {
  rut_estudiante: 'Con o sin puntos, con guion',
  nombre: 'Solo el/los nombre(s)',
  apellido: 'Apellido(s)',
  email: 'correo@dominio.com',
  telefono: 'Móvil chileno (9 dígitos)',
  fecha_nacimiento: 'DD/MM/AAAA o AAAA-MM-DD',
  direccion: 'Calle y número',
  genero: 'MASCULINO / FEMENINO / NO_BINARIO',
  rbd_liceo: 'RBD del liceo (debe existir)',
  promedios_media: 'Entre 1.0 y 7.0 (coma o punto)',
};

/**
 * Ancho aproximado de cada columna en la plantilla (en caracteres) para que
 * Excel muestre el contenido sin que el usuario tenga que ajustar a mano.
 */
const ANCHOS: Record<ColumnaPlantilla, number> = {
  rut_estudiante: 16,
  nombre: 16,
  apellido: 20,
  email: 24,
  telefono: 20,
  fecha_nacimiento: 20,
  direccion: 22,
  genero: 26,
  rbd_liceo: 24,
  promedios_media: 24,
};

/**
 * Genera y descarga la plantilla de estudiantes en formato .xlsx.
 *
 * El .xlsx trae las columnas ya separadas por Excel (no depende del separador
 * regional , o ; como ocurría con el CSV) y con anchos preajustados, evitando
 * el formateo manual que introducía errores tipográficos.
 *
 * Estructura:
 *   Fila 1 → encabezados (nombres de columna)
 *   Fila 2 → ejemplo de datos
 *   Fila 3 → breve descripción del formato de cada columna
 *
 * El usuario debe BORRAR las filas 2 y 3 antes de subir y escribir sus datos
 * desde la fila 2.
 */
export function descargarPlantillaEstudiantes(): void {
  const encabezados = [...COLUMNAS_PLANTILLA];
  const ejemplo = COLUMNAS_PLANTILLA.map((c) => FILA_EJEMPLO[c]);
  const descripcion = COLUMNAS_PLANTILLA.map((c) => FILA_DESCRIPCION[c]);

  const ws = XLSX.utils.aoa_to_sheet([encabezados, ejemplo, descripcion]);
  ws['!cols'] = COLUMNAS_PLANTILLA.map((c) => ({ wch: ANCHOS[c] }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes');
  XLSX.writeFile(wb, 'plantilla_estudiantes.xlsx');
}
