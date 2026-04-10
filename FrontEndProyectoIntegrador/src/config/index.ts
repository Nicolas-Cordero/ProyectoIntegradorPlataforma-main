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
 * Configuración de la aplicación
 * Utiliza variables de entorno con fallbacks seguros
 */
export const config: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  environment: (import.meta.env.VITE_ENV || 'development') as 'development' | 'production',
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  enableDebugLogs: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',
};

/**
 * Utilidad para logging condicional según configuración
 */
export const logger = {
  log: (...args: any[]) => {
    if (config.enableDebugLogs) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Errores siempre se logean
    console.error(...args);
  },
  warn: (...args: any[]) => {
    if (config.enableDebugLogs) {
      console.warn(...args);
    }
  },
};
