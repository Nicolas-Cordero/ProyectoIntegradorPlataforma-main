import * as XLSX from 'xlsx';
import {
  normalizarRut,
  normalizarTelefono,
  esTelefonoValido,
  isValidEmail,
} from '../validators';
import { COLUMNAS_PLANTILLA, type ColumnaPlantilla } from './plantilla';
import type { CreateEstudianteDto } from '../../services/estudiante.service';
import type { Genero } from '../../types';

// ── Tipos del resultado de importación ──────────────────────────────────────

/** Estado de una celda tras normalizar y validar. */
export interface CeldaValidada {
  /** Lo que se mostrará en el preview (valor normalizado si aplica). */
  valor: string;
  /** Mensaje de error si la celda es inválida; undefined si está OK. */
  error?: string;
}

export interface FilaValidada {
  /** Número de fila REAL en el Excel (la fila 1 es el encabezado). */
  numeroFila: number;
  celdas: Record<ColumnaPlantilla, CeldaValidada>;
  /** Lista de errores de la fila, en lenguaje entendible. */
  errores: string[];
  valida: boolean;
  /** DTO listo para enviar; solo presente si la fila es 100% válida. */
  dto?: CreateEstudianteDto;
}

export interface ResultadoImportacion {
  /** Columnas esperadas que faltan en el archivo. */
  columnasFaltantes: string[];
  /** Columnas del archivo que no corresponden a la plantilla. */
  columnasSobrantes: string[];
  filas: FilaValidada[];
  totalValidas: number;
  totalInvalidas: number;
  /** true solo si los encabezados son correctos, hay filas y TODAS son válidas. */
  puedeImportar: boolean;
}

/** Datos existentes en el sistema para validar unicidad y llaves foráneas. */
export interface ContextoValidacion {
  generacionId: number;
  rutsExistentes: Set<string>;
  emailsExistentes: Set<string>;
  rbdsValidos: Set<string>;
}

// ── Parsers flexibles de cada campo ─────────────────────────────────────────

/** Quita tildes y pasa a minúsculas para comparar de forma laxa. */
function normalizarTexto(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Valida el dígito verificador de un RUT chileno ya normalizado (cuerpo-guion-DV).
 * Atrapa errores tipográficos que un chequeo de solo formato dejaría pasar.
 */
export function rutDVValido(rutNormalizado: string): boolean {
  const m = rutNormalizado.match(/^(\d{7,8})-([\dkK])$/);
  if (!m) return false;
  const cuerpo = m[1];
  const dv = m[2].toUpperCase();
  let suma = 0;
  let mul = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === dvEsperado;
}

/**
 * Interpreta una fecha flexible y la devuelve como ISO 8601, o null si no es
 * válida. Acepta:
 *   - AAAA-MM-DD (ISO)
 *   - DD/MM/AAAA, DD-MM-AAAA, DD.MM.AAAA (día primero, uso chileno)
 *   - Fechas nativas de Excel (llegan ya como AAAA-MM-DD desde el parser).
 * Usa UTC para que la fecha no se desplace por zona horaria.
 */
export function parseFechaNacimiento(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;

  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) return construirISO(+iso[1], +iso[2], +iso[3]);

  const dmy = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmy) return construirISO(+dmy[3], +dmy[2], +dmy[1]);

  return null;
}

function construirISO(anio: number, mes: number, dia: number): string | null {
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  // Round-trip: descarta fechas imposibles como 31/02.
  if (
    fecha.getUTCFullYear() !== anio ||
    fecha.getUTCMonth() !== mes - 1 ||
    fecha.getUTCDate() !== dia
  ) {
    return null;
  }
  const hoy = new Date();
  if (fecha.getTime() > hoy.getTime()) return null; // no fechas futuras
  return fecha.toISOString();
}

/** Interpreta el género de forma flexible; null si no reconoce un valor válido. */
export function parseGenero(raw: string): Genero | null {
  const s = normalizarTexto(raw);
  if (['masculino', 'm', 'hombre', 'h'].includes(s)) return 'MASCULINO';
  if (['femenino', 'f', 'mujer'].includes(s)) return 'FEMENINO';
  if (['no binario', 'no_binario', 'no-binario', 'nobinario', 'nb'].includes(s))
    return 'NO_BINARIO';
  return null;
}

/** Interpreta el promedio con coma o punto; null si no es válido (1.0–7.0, 1 decimal). */
export function parsePromedio(raw: string): number | null {
  const s = raw.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const n = parseFloat(s);
  if (isNaN(n)) return null;
  if (Math.round(n * 10) !== n * 10) return null; // más de un decimal
  if (n < 1 || n > 7) return null;
  return Math.round(n * 10) / 10;
}

// ── Lectura del archivo ─────────────────────────────────────────────────────

interface MatrizArchivo {
  encabezados: string[];
  filas: { numeroFila: number; celdas: string[] }[];
}

/**
 * Lee el .xlsx / .csv y devuelve la matriz de celdas como texto, conservando el
 * número de fila real de cada registro (para poder señalar la fila con error).
 */
export function leerArchivoEstudiantes(file: File): Promise<MatrizArchivo> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, {
          type: 'array',
          cellDates: true,
        });
        const ws = wb.Sheets[wb.SheetNames[0]];
        if (!ws) {
          reject(new Error('El archivo no contiene ninguna hoja de cálculo.'));
          return;
        }
        // blankrows: true conserva las filas vacías intermedias para que el
        // índice de cada fila siga correspondiendo a su número real en el Excel
        // (necesario para señalar la fila exacta con error). Las filas vacías se
        // descartan luego durante la validación.
        const matriz: string[][] = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          raw: false,
          dateNF: 'yyyy-mm-dd',
          defval: '',
          blankrows: true,
        });

        const encabezados = (matriz[0] ?? []).map((h) => String(h).trim());
        const filas = matriz.slice(1).map((fila, i) => ({
          // +2: la fila 1 es el encabezado y `i` arranca en la 2ª fila de datos.
          numeroFila: i + 2,
          celdas: (fila ?? []).map((c) => String(c ?? '').trim()),
        }));
        resolve({ encabezados, filas });
      } catch {
        reject(
          new Error(
            'No se pudo leer el archivo. Verifica que sea un .xlsx o .csv válido.',
          ),
        );
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsArrayBuffer(file);
  });
}

// ── Validación completa ─────────────────────────────────────────────────────

function celda(valor: string, error?: string): CeldaValidada {
  return error ? { valor, error } : { valor };
}

/**
 * Valida los encabezados y cada fila del archivo ya leído, produciendo el
 * resultado que consume el modal. No hace ninguna llamada de red: toda la
 * validación ocurre en el cliente ANTES de enviar nada al backend.
 */
export function validarImportacion(
  matriz: MatrizArchivo,
  ctx: ContextoValidacion,
): ResultadoImportacion {
  const columnas = [...COLUMNAS_PLANTILLA];
  const encabezadosNorm = matriz.encabezados.map((h) => h.toLowerCase());

  const columnasFaltantes = columnas.filter(
    (c) => !encabezadosNorm.includes(c),
  );
  const columnasSobrantes = matriz.encabezados.filter(
    (h) => h !== '' && !columnas.includes(h.toLowerCase() as ColumnaPlantilla),
  );

  // Si el encabezado no calza, no tiene sentido validar filas: se bloquea todo.
  if (columnasFaltantes.length > 0 || columnasSobrantes.length > 0) {
    return {
      columnasFaltantes,
      columnasSobrantes,
      filas: [],
      totalValidas: 0,
      totalInvalidas: 0,
      puedeImportar: false,
    };
  }

  const indicePorColumna = (col: ColumnaPlantilla) =>
    encabezadosNorm.indexOf(col);

  // Duplicados dentro del propio archivo.
  const rutsEnArchivo = new Set<string>();
  const emailsEnArchivo = new Set<string>();

  const filas: FilaValidada[] = [];

  for (const filaCruda of matriz.filas) {
    const valor = (col: ColumnaPlantilla) =>
      (filaCruda.celdas[indicePorColumna(col)] ?? '').trim();

    // Fila completamente vacía: no es un registro, se ignora.
    if (columnas.every((c) => valor(c) === '')) continue;

    const errores: string[] = [];
    const celdas = {} as Record<ColumnaPlantilla, CeldaValidada>;
    const agregarError = (msg: string) => errores.push(msg);

    // rut_estudiante
    const rutRaw = valor('rut_estudiante');
    const rut = normalizarRut(rutRaw);
    let rutError: string | undefined;
    if (!rutRaw) {
      rutError = 'RUT vacío';
    } else if (!rutDVValido(rut)) {
      rutError = 'RUT inválido (revisa dígito verificador)';
    } else if (rutsEnArchivo.has(rut)) {
      rutError = 'RUT repetido dentro del archivo';
    } else if (ctx.rutsExistentes.has(rut)) {
      rutError = 'Ya existe un estudiante con este RUT';
    }
    if (rutError) agregarError(`RUT: ${rutError}`);
    else rutsEnArchivo.add(rut);
    celdas.rut_estudiante = celda(rut || rutRaw, rutError);

    // nombre
    const nombre = valor('nombre');
    let nombreError: string | undefined;
    if (!nombre) nombreError = 'Nombre vacío';
    else if (nombre.length < 2) nombreError = 'Nombre demasiado corto';
    if (nombreError) agregarError(`Nombre: ${nombreError}`);
    celdas.nombre = celda(nombre, nombreError);

    // apellido
    const apellido = valor('apellido');
    let apellidoError: string | undefined;
    if (!apellido) apellidoError = 'Apellido vacío';
    else if (apellido.length < 2) apellidoError = 'Apellido demasiado corto';
    if (apellidoError) agregarError(`Apellido: ${apellidoError}`);
    celdas.apellido = celda(apellido, apellidoError);

    // email
    const emailRaw = valor('email');
    const email = emailRaw.toLowerCase();
    let emailError: string | undefined;
    if (!emailRaw) {
      emailError = 'Email vacío';
    } else if (!isValidEmail(emailRaw)) {
      emailError = 'Email con formato inválido';
    } else if (emailsEnArchivo.has(email)) {
      emailError = 'Email repetido dentro del archivo';
    } else if (ctx.emailsExistentes.has(email)) {
      emailError = 'Ya existe un estudiante con este email';
    }
    if (emailError) agregarError(`Email: ${emailError}`);
    else emailsEnArchivo.add(email);
    celdas.email = celda(emailRaw, emailError);

    // telefono
    const telRaw = valor('telefono');
    const telefono = normalizarTelefono(telRaw);
    let telError: string | undefined;
    if (!telRaw) telError = 'Teléfono vacío';
    else if (!esTelefonoValido(telRaw))
      telError = 'Teléfono inválido (móvil chileno de 9 dígitos)';
    if (telError) agregarError(`Teléfono: ${telError}`);
    celdas.telefono = celda(telefono, telError);

    // fecha_nacimiento
    const fechaRaw = valor('fecha_nacimiento');
    const fechaISO = parseFechaNacimiento(fechaRaw);
    let fechaError: string | undefined;
    if (!fechaRaw) fechaError = 'Fecha vacía';
    else if (!fechaISO) fechaError = 'Fecha inválida (usa DD/MM/AAAA)';
    if (fechaError) agregarError(`Fecha nacimiento: ${fechaError}`);
    celdas.fecha_nacimiento = celda(
      fechaISO ? fechaISO.slice(0, 10) : fechaRaw,
      fechaError,
    );

    // direccion
    const direccion = valor('direccion');
    const direccionError = direccion ? undefined : 'Dirección vacía';
    if (direccionError) agregarError(`Dirección: ${direccionError}`);
    celdas.direccion = celda(direccion, direccionError);

    // genero
    const generoRaw = valor('genero');
    const genero = parseGenero(generoRaw);
    let generoError: string | undefined;
    if (!generoRaw) generoError = 'Género vacío';
    else if (!genero)
      generoError = 'Género inválido (MASCULINO / FEMENINO / NO_BINARIO)';
    if (generoError) agregarError(`Género: ${generoError}`);
    celdas.genero = celda(genero ?? generoRaw, generoError);

    // rbd_liceo
    const rbd = valor('rbd_liceo');
    let rbdError: string | undefined;
    if (!rbd) rbdError = 'RBD vacío';
    else if (!ctx.rbdsValidos.has(rbd))
      rbdError = 'El RBD no corresponde a ningún liceo registrado';
    if (rbdError) agregarError(`RBD liceo: ${rbdError}`);
    celdas.rbd_liceo = celda(rbd, rbdError);

    // promedios_media
    const promRaw = valor('promedios_media');
    const promedio = parsePromedio(promRaw);
    let promError: string | undefined;
    if (!promRaw) promError = 'Promedio vacío';
    else if (promedio === null)
      promError = 'Promedio inválido (1.0 a 7.0, con hasta un decimal)';
    if (promError) agregarError(`Promedio: ${promError}`);
    celdas.promedios_media = celda(
      promedio !== null ? promedio.toFixed(1) : promRaw,
      promError,
    );

    const valida = errores.length === 0;
    const dto: CreateEstudianteDto | undefined =
      valida && fechaISO && genero
        ? {
            rut_estudiante: rut,
            nombre,
            apellido,
            email: emailRaw,
            telefono,
            fecha_nacimiento: fechaISO,
            direccion,
            genero,
            rbd_liceo: rbd,
            promedios_media: promedio as number,
            generacion_id: ctx.generacionId,
          }
        : undefined;

    filas.push({
      numeroFila: filaCruda.numeroFila,
      celdas,
      errores,
      valida,
      dto,
    });
  }

  const totalValidas = filas.filter((f) => f.valida).length;
  const totalInvalidas = filas.length - totalValidas;

  return {
    columnasFaltantes,
    columnasSobrantes,
    filas,
    totalValidas,
    totalInvalidas,
    puedeImportar: filas.length > 0 && totalInvalidas === 0,
  };
}
