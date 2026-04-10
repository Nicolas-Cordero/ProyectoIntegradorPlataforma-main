/**
 * Constantes globales de la aplicación
 */

export const APP_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_SORT_ORDER: 'ASC',
} as const;

export const HTTP_MESSAGES = {
  NOT_FOUND: 'Recurso no encontrado',
  INTERNAL_ERROR: 'Error interno del servidor',
  BAD_REQUEST: 'Solicitud inválida',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
} as const;

export const DATABASE_CONSTANTS = {
  MAX_QUERY_TIMEOUT: 30000, // 30 segundos
  DEFAULT_CONNECTION_RETRY: 3,
} as const;
