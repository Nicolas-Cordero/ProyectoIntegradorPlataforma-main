import type { CookieOptions } from 'express';

type SameSite = 'lax' | 'strict' | 'none';

const SAMESITE_VALIDOS: readonly SameSite[] = ['lax', 'strict', 'none'];

/**
 * Opciones de las cookies de sesión (`access_token` / `refresh_token`).
 *
 * En producción el front (`gestion-becarios.` y `becario.`) y la API (`api.`)
 * son subdominios del MISMO dominio registrable, así que el navegador los trata
 * como *same-site*: `SameSite=Lax` basta para que la cookie viaje en las
 * peticiones `fetch` y además corta el CSRF desde sitios de terceros, cosa que
 * `None` no hace. El `None` histórico venía de cuando el front estaba en Vercel
 * (dominio distinto); si alguna vez vuelve un front cross-site, se cambia con
 * COOKIE_SAMESITE=none sin tocar el código.
 *
 * Todo es sobreescribible por entorno para no depender de que la plataforma de
 * despliegue inyecte NODE_ENV correctamente (un fallo silencioso conocido).
 */
export function buildCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: parseBooleano('COOKIE_SECURE', process.env.COOKIE_SECURE) ?? isProd,
    sameSite: parseSameSite(process.env.COOKIE_SAMESITE) ?? 'lax',
    // Explícito: `clearCookie` solo borra si el path coincide con el del
    // `Set-Cookie` original, y el default de Express podría cambiar.
    path: '/',
    // Sin dominio la cookie es host-only (solo `api.…`), que es lo correcto
    // aquí. Solo hace falta COOKIE_DOMAIN si se compartiera entre subdominios.
    ...(process.env.COOKIE_DOMAIN
      ? { domain: process.env.COOKIE_DOMAIN.trim() }
      : {}),
  };
}

/**
 * Valida la configuración al arrancar. Sin esto, una combinación inválida no da
 * ningún error: el servidor responde 200 al login, el navegador descarta el
 * `Set-Cookie` en silencio y todo lo demás devuelve 401 sin pista de la causa.
 */
export function validateCookieConfig(): void {
  const { secure, sameSite, domain } = buildCookieOptions();

  if (sameSite === 'none' && !secure) {
    throw new Error(
      'Configuración de cookies inválida: SameSite=None exige Secure. Los ' +
        'navegadores descartan el Set-Cookie entero y la sesión nunca se ' +
        'guarda. Define COOKIE_SECURE=true (o usa COOKIE_SAMESITE=lax).',
    );
  }

  if (domain && /[:/]/.test(domain)) {
    throw new Error(
      `COOKIE_DOMAIN debe ser solo el dominio ("fundacioncarmengoudie.cl"), ` +
        `sin esquema, puerto ni ruta. Valor recibido: "${domain}".`,
    );
  }
}

function parseSameSite(valor: string | undefined): SameSite | undefined {
  const normalizado = valor?.trim().toLowerCase();
  if (!normalizado) return undefined;

  if (!SAMESITE_VALIDOS.includes(normalizado as SameSite)) {
    throw new Error(
      `COOKIE_SAMESITE debe ser uno de ${SAMESITE_VALIDOS.join(' | ')}. ` +
        `Valor recibido: "${valor}".`,
    );
  }
  return normalizado as SameSite;
}

function parseBooleano(
  nombre: string,
  valor: string | undefined,
): boolean | undefined {
  const normalizado = valor?.trim().toLowerCase();
  if (!normalizado) return undefined;

  if (['true', '1', 'yes'].includes(normalizado)) return true;
  if (['false', '0', 'no'].includes(normalizado)) return false;

  throw new Error(
    `${nombre} debe ser true o false. Valor recibido: "${valor}".`,
  );
}
