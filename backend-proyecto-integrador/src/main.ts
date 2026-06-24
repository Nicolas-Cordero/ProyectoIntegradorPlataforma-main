import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter, HttpExceptionFilter } from './common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && !process.env.CORS_ORIGINS) {
    throw new Error('CORS_ORIGINS no está definido. Revisa las variables de entorno.');
  }

  // Lista explícita de orígenes (exacto, case-sensitive).
  const allowedOrigins = process.env.CORS_ORIGINS
    ?.split(',')
    .map((o) => o.trim())
    .filter(Boolean) || [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  // Patrones regex opcionales (CORS_PATTERNS=^https://.*\.vercel\.app$,...).
  const allowedPatterns: RegExp[] = (process.env.CORS_PATTERNS ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => new RegExp(p));

  // Patrones siempre activos en desarrollo: red local + túneles comunes.
  const devPatterns: RegExp[] = isProd
    ? []
    : [
        // Red local (cualquier puerto)
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
        /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
        /^https?:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
        /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}(:\d+)?$/,
        // Túneles de desarrollo
        /^https:\/\/[^.]+\.devtunnels\.ms$/,   // VS Code Dev Tunnels
        /^https:\/\/[^.]+\.ngrok-free\.app$/,  // ngrok (plan free)
        /^https:\/\/[^.]+\.ngrok\.io$/,        // ngrok (plan pago)
        /^https:\/\/[^.]+\.loca\.lt$/,         // localtunnel
        /^https:\/\/[^.]+\.trycloudflare\.com$/,
      ];

  const isAllowed = (origin: string): boolean => {
    if (allowedOrigins.includes(origin)) return true;
    if ([...allowedPatterns, ...devPatterns].some((re) => re.test(origin))) return true;
    return false;
  };

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Sin origen → petición mobile/native (Flutter APK) o curl.
      if (!origin) return callback(null, true);

      if (isAllowed(origin)) return callback(null, true);

      logger.warn(`CORS bloqueado: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const messages = errors
          .flatMap((err) => Object.values(err.constraints || {}))
          .join('; ');
        return new BadRequestException(messages || 'Datos de entrada inválidos');
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`Server running on port: ${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
