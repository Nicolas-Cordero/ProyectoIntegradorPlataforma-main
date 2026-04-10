import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS para producción
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'https://entrevistas.fundacioncarmengoudie.cl',
    'https://api.cloudinary.com',
    'http://localhost:5173', // Vite dev
    'http://127.0.0.1:5173',
    'http://localhost:3000', // Front dev/preview
    'http://127.0.0.1:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (como Postman, curl, o same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
    maxAge: 3600, // Cache preflight por 1 hora
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Server running on port: ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ CORS enabled for: ${allowedOrigins.join(', ')}`);
}
bootstrap();
