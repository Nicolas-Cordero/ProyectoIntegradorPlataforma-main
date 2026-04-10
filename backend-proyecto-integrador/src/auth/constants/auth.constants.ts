export const JWT_CONFIG = {
  ACCESS_TOKEN: {
    SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    EXPIRATION: process.env.JWT_EXPIRATION || '15m',
  },
  REFRESH_TOKEN: {
    SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
    EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
} as const;

export const AUTH_MESSAGES = {
  //Auth/login
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  USER_INACTIVE: 'Usuario inactivo',
  USER_NOT_FOUND: 'Usuario no encontrado o inactivo',
  INVALID_REFRESH_TOKEN: 'Refresh token inválido',
  EXPIRED_REFRESH_TOKEN: 'Refresh token inválido o expirado',
  UNAUTHORIZED_USER: 'Usuario no autorizado o inactivo',
  LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
  
  //Register
  USERNAME_ALREADY_EXISTS: 'El nombre de usuario ya está en uso',
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
  REGISTRATION_SUCCESS: 'Usuario registrado exitosamente',
} as const;
