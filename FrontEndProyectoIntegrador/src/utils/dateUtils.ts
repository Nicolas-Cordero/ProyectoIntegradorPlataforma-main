/**
 * Utilidades de fechas (formateo, comparación y cálculo).
 *
 * ## Fechas de calendario vs. instantes
 *
 * El backend guarda dos cosas distintas en columnas `DateTime`:
 *
 * - **Fechas de calendario** (`fecha_nacimiento`, `inicio` de un beneficio):
 *   un día, sin hora. Nacen de un `<input type="date">`, viajan
 *   como `"2026-01-15"` y Prisma las devuelve como `"2026-01-15T00:00:00.000Z"`
 *   — medianoche **UTC**.
 * - **Instantes** (`created_at`, `updated_at`, `fecha_hora` de una entrevista):
 *   un momento exacto en el tiempo.
 *
 * `toLocaleDateString('es-CL')` convierte a la zona local del navegador, que en
 * Chile es UTC-3/UTC-4. Para un instante eso es lo correcto; para una fecha de
 * calendario **resta un día**: el usuario elige el 15 y la ficha muestra el 14.
 * Ese bug apareció repetido en cuatro lugares del proyecto.
 *
 * Por eso `formatDate` y `formatDateLong` distinguen ambos casos por la forma
 * del valor y solo convierten la zona horaria cuando el valor es realmente un
 * instante. Es el comportamiento correcto por defecto: no hay que acordarse de
 * elegir la función adecuada en cada llamada.
 *
 * Única limitación conocida: un instante que caiga exactamente en medianoche
 * UTC (`00:00:00.000Z`) se lee como fecha de calendario. En la práctica no
 * ocurre — `now()` tiene precisión de microsegundos y las entrevistas se
 * agendan en horario hábil chileno.
 */

export type EntradaFecha = string | Date | null | undefined;

/** `2026-01-15`, con o sin un componente horario en medianoche UTC. */
const SOLO_FECHA =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ]00:00:00(?:\.0+)?(?:Z|\+00:?00)?)?$/;

interface PartesCalendario {
  anio: number;
  mes: number; // 1-12
  dia: number;
}

/**
 * Devuelve las partes de calendario si el valor representa un día sin hora, o
 * `null` si es un instante que sí debe convertirse a la zona local.
 */
function partesCalendario(valor: string | Date): PartesCalendario | null {
  if (typeof valor === 'string') {
    const m = SOLO_FECHA.exec(valor.trim());
    return m
      ? { anio: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]) }
      : null;
  }

  const esMedianocheUTC =
    valor.getUTCHours() === 0 &&
    valor.getUTCMinutes() === 0 &&
    valor.getUTCSeconds() === 0 &&
    valor.getUTCMilliseconds() === 0;

  return esMedianocheUTC
    ? {
        anio: valor.getUTCFullYear(),
        mes: valor.getUTCMonth() + 1,
        dia: valor.getUTCDate(),
      }
    : null;
}

/** Convierte a `Date` válido, o `null` si el valor es vacío o basura. */
function aFecha(valor: EntradaFecha): Date | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const d = valor instanceof Date ? valor : new Date(valor);
  // new Date('basura') no lanza: devuelve Invalid Date. Validar con getTime().
  return isNaN(d.getTime()) ? null : d;
}

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

// ============================================
// FORMATEO
// ============================================

/**
 * Formatea una fecha en formato chileno `DD-MM-YYYY`.
 *
 * Las fechas de calendario se muestran tal como se guardaron; los instantes se
 * convierten a la zona local. Ver la nota al inicio del archivo.
 */
export function formatDate(valor: EntradaFecha, fallback = '—'): string {
  const fecha = aFecha(valor);
  if (!fecha) return fallback;

  const partes = partesCalendario(valor as string | Date);
  if (partes) {
    const dd = String(partes.dia).padStart(2, '0');
    const mm = String(partes.mes).padStart(2, '0');
    return `${dd}-${mm}-${partes.anio}`;
  }

  return fecha.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Formato largo: `15 de enero de 2026`. Misma distinción que `formatDate`. */
export function formatDateLong(valor: EntradaFecha, fallback = '—'): string {
  const fecha = aFecha(valor);
  if (!fecha) return fallback;

  const partes = partesCalendario(valor as string | Date);
  if (partes) {
    return `${partes.dia} de ${MESES[partes.mes - 1]} de ${partes.anio}`;
  }

  return fecha.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Fecha y hora de un instante (`DD-MM-YYYY HH:MM`), en la zona local.
 *
 * Solo tiene sentido sobre instantes: si el valor es una fecha de calendario la
 * hora que muestre es artificial.
 */
export function formatDateTime(valor: EntradaFecha, fallback = '—'): string {
  const fecha = aFecha(valor);
  if (!fecha) return fallback;

  const dia = fecha.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const hora = fecha.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dia} ${hora}`;
}

/** Fecha en formato `YYYY-MM-DD` para un `<input type="date">`. */
export function toInputDate(valor: EntradaFecha): string {
  const fecha = aFecha(valor);
  if (!fecha) return '';

  const partes = partesCalendario(valor as string | Date);
  if (partes) {
    const dd = String(partes.dia).padStart(2, '0');
    const mm = String(partes.mes).padStart(2, '0');
    return `${partes.anio}-${mm}-${dd}`;
  }

  // Instante: el día que corresponde en la zona local, no en UTC.
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Descripción relativa: `Hoy`, `Hace 3 días`, `Hace 2 meses`. */
export function formatRelativeDate(valor: EntradaFecha, fallback = '—'): string {
  const dias = daysSince(valor);
  if (dias === null) return fallback;

  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Hace 1 día';
  if (dias < 7) return `Hace ${dias} días`;
  if (dias < 30) {
    const semanas = Math.floor(dias / 7);
    return `Hace ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
  }
  if (dias < 365) {
    const meses = Math.floor(dias / 30);
    return `Hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  }
  const anios = Math.floor(dias / 365);
  return `Hace ${anios} ${anios === 1 ? 'año' : 'años'}`;
}

// ============================================
// CÁLCULO
// ============================================

/** Días transcurridos desde una fecha, o `null` si el valor no es válido. */
export function daysSince(valor: EntradaFecha): number | null {
  const fecha = aFecha(valor);
  if (!fecha) return null;
  return Math.floor((Date.now() - fecha.getTime()) / 86_400_000);
}

/** Días entre dos fechas, o `null` si alguna no es válida. */
export function daysBetween(desde: EntradaFecha, hasta: EntradaFecha): number | null {
  const a = aFecha(desde);
  const b = aFecha(hasta);
  if (!a || !b) return null;
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

/**
 * Edad en años a partir de la fecha de nacimiento, o `null` si no es válida.
 *
 * Compara partes de calendario, no instantes: de lo contrario el cumpleaños se
 * adelanta un día por la conversión de zona horaria.
 */
export function calculateAge(fechaNacimiento: EntradaFecha): number | null {
  const fecha = aFecha(fechaNacimiento);
  if (!fecha) return null;

  const partes = partesCalendario(fechaNacimiento as string | Date) ?? {
    anio: fecha.getFullYear(),
    mes: fecha.getMonth() + 1,
    dia: fecha.getDate(),
  };

  const hoy = new Date();
  let edad = hoy.getFullYear() - partes.anio;
  const difMes = hoy.getMonth() + 1 - partes.mes;
  if (difMes < 0 || (difMes === 0 && hoy.getDate() < partes.dia)) edad--;
  return edad;
}

/** `true` si el valor se puede interpretar como una fecha válida. */
export function isValidDate(valor: unknown): boolean {
  return aFecha(valor as EntradaFecha) !== null;
}

/** Año actual, en la zona local. */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}
