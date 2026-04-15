import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'https://api.cloudinary.com', //imagenes
    'http://localhost:5173', // Vite dev
    'http://localhost:3000',
  ];

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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`- Server running on port: ${port}`); //muestra el puerto
  console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`); //muestra el ambiente
  console.log(`- CORS enabled for: ${allowedOrigins.join(', ')}`); //muestra los origenes permitidos
}
bootstrap();
