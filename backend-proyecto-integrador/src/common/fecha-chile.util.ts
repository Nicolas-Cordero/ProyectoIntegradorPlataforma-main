const ZONA_CHILE = 'America/Santiago';

/**
 * Instante (UTC) en que comienza el año en curso en Chile continental, es
 * decir, el 1 de enero a las 00:00 hora de Chile. Se calcula con la zona
 * horaria y no con la del servidor, que puede estar en UTC.
 */
export function inicioAnioChile(ahora: Date = new Date()): Date {
  const anio = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: ZONA_CHILE,
      year: 'numeric',
    }).format(ahora),
  );
  const medianocheUtc = Date.UTC(anio, 0, 1);

  // Desfase de Chile respecto de UTC en esa fecha (en enero rige el horario
  // de verano, UTC−3, pero no se asume: se obtiene de la zona horaria).
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: ZONA_CHILE,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(medianocheUtc)
      .map((p) => [p.type, p.value]),
  );
  const horaChileComoUtc = Date.UTC(
    Number(partes.year),
    Number(partes.month) - 1,
    Number(partes.day),
    Number(partes.hour),
    Number(partes.minute),
    Number(partes.second),
  );
  const desfase = horaChileComoUtc - medianocheUtc;

  return new Date(medianocheUtc - desfase);
}
