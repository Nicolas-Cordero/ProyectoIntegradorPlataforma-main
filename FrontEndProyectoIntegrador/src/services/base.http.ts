const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Opciones de petición. `requireAuth` es una marca semántica: la autenticación
 * siempre viaja en la cookie HTTP-only (credentials: 'include'), por lo que la
 * bandera no altera el comportamiento; se acepta para documentar la intención
 * en los servicios y se elimina antes de pasar las opciones a fetch().
 */
export interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
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
      if (endpoint === '/auth/refresh') {
        window.location.href = '/';
        return undefined as T;
      }

      const refreshed = await tryRefresh();
      if (!refreshed) {
        window.location.href = '/';
        return undefined as T;
      }

      // Reintentar la petición original con el nuevo access_token en cookie
      const retryResponse = await fetch(url, config);
      if (retryResponse.status === 401) {
        window.location.href = '/';
        return undefined as T;
      }
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
