import { registerAs } from '@nestjs/config';

/**
 * Configuración de bases de datos
 */
export default registerAs('database', () => ({
  postgres: {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'myapp',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/proyecto_integrador',
  },
}));
