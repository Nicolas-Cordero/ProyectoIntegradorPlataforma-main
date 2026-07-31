/**
 * Configuración centralizada de la aplicación
 * Lee variables de entorno y proporciona valores por defecto seguros
 */

interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'production';
  enableMockData: boolean;
  enableDebugLogs: boolean;
}

/**
 * URL base del backend. Única fuente de verdad: el resto de la aplicación debe
 * importar esta constante en lugar de leer `import.meta.env` por su cuenta.
 *
 * Vite incrusta las variables en tiempo de compilación. Si se compila sin
 * VITE_API_URL definida (los .env están en .gitignore, así que no viajan al
 * entorno de build), un fallback silencioso a localhost produce un bundle que
 * apunta a la máquina del propio usuario: todas las peticiones fallan con
 * "Failed to fetch" y no queda rastro en los logs del servidor. Por eso en
 * producción esto revienta de inmediato en vez de degradarse en silencio.
 */
function resolveApiUrl(): string {
  const url = import.meta.env.VITE_API_URL;

  if (!url) {
    if (import.meta.env.PROD) {
      throw new Error(
        'VITE_API_URL no está definida. El bundle de producción se compiló sin ' +
          'la URL del backend; defínela en el entorno de build y vuelve a desplegar.',
      );
    }
    return 'http://localhost:3000';
  }

  return url;
}

export const API_BASE_URL = resolveApiUrl();

/**
 * Configuración de la aplicación
 * Utiliza variables de entorno con fallbacks seguros
 */
export const config: AppConfig = {
  apiUrl: API_BASE_URL,
  environment: (import.meta.env.VITE_ENV || 'development') as 'development' | 'production',
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  enableDebugLogs: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',
};

/**
 * Utilidad para logging condicional según configuración
 */
export const logger = {
  log: (...args: unknown[]) => {
    if (config.enableDebugLogs) {
      console.log(...args);
    }
  },
  error: (...args: unknown[]) => {
    // Errores siempre se logean
    console.error(...args);
  },
  warn: (...args: unknown[]) => {
    if (config.enableDebugLogs) {
      console.warn(...args);
    }
  },
};
