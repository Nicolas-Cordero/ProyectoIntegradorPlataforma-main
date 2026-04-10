import { registerAs } from '@nestjs/config';

/**
 * Configuración de JWT
 */
export default registerAs('jwt', () => ({
  access: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRATION || '15m',
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
}));
