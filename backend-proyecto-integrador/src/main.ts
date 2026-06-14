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

  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true
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
          .flatMap(err => Object.values(err.constraints || {}))
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
