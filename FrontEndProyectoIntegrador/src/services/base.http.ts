const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
}

export class BaseHttpClient {
  protected async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = localStorage.getItem('accesstoken');
    if (token && options.requireAuth !== false) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);
    
    // Interceptar 401 para limpiar token expirado
    if (response.status === 401 && token) {
      localStorage.removeItem('accesstoken');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshtoken');
      window.location.href = '/';
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Algunos endpoints (DELETE) pueden responder 204 sin cuerpo
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    // Si no hay cuerpo, evitar error de parseo
    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }
}
