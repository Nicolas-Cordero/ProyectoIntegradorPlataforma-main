import { API_BASE_URL } from '../config';

/**
 * Opciones de petición. `requireAuth` es una marca semántica: la autenticación
 * siempre viaja en la cookie HTTP-only (credentials: 'include'), por lo que la
 * bandera no altera el comportamiento; se acepta para documentar la intención
 * en los servicios y se elimina antes de pasar las opciones a fetch().
 */
export interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

/** Se lanza cuando la sesión caducó y no se pudo renovar. */
export class SessionExpiredError extends Error {
  constructor() {
    super('Tu sesión expiró. Vuelve a iniciar sesión.');
    this.name = 'SessionExpiredError';
  }
}

/**
 * Redirige al login y corta la petición en curso.
 *
 * Tiene que LANZAR, no devolver: `window.location.href` no detiene la ejecución
 * (la navegación se encola y el JS sigue corriendo hasta que el navegador
 * descarga la página, y si ya estás en '/' puede que ni navegue). Cuando esto
 * devolvía `undefined`, la promesa se cumplía en vez de rechazar, así que los
 * `.catch()` de los llamadores no se disparaban y el `undefined` llegaba hasta
 * el primer `.map()` — que reventaba con un TypeError en lugar de mostrar
 * "sesión expirada".
 */
function sesionExpirada(): never {
  window.location.href = '/';
  throw new SessionExpiredError();
}

// Evita múltiples llamadas simultáneas al endpoint de refresh
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => { refreshPromise = null; });

  return refreshPromise;
}

export class BaseHttpClient {
  protected async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // `config` se tipa como RequestInit: `requireAuth` queda fuera del tipo y fetch
    // ignora cualquier propiedad desconocida en runtime.
    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
      // No intentar refresh si la petición fallida ya era /auth/refresh
      if (endpoint === '/auth/refresh') sesionExpirada();

      const refreshed = await tryRefresh();
      if (!refreshed) sesionExpirada();

      // Reintentar la petición original con el nuevo access_token en cookie
      const retryResponse = await fetch(url, config);
      if (retryResponse.status === 401) sesionExpirada();

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
      }
      if (retryResponse.status === 204 || retryResponse.headers.get('content-length') === '0') {
        return undefined as T;
      }
      const retryText = await retryResponse.text();
      if (!retryText) return undefined as T;
      return JSON.parse(retryText) as T;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Algunos endpoints (DELETE) pueden responder 204 sin cuerpo
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) return undefined as T;

    return JSON.parse(text) as T;
  }
}
