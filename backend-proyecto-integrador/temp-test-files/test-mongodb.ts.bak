// src/test-mongodb-direct.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Entrevista } from './entrevistas/schemas/entrevista.schema';
import { Model } from 'mongoose';

async function testMongoDBDirect() {
  console.log('🔄 Probando MongoDB directamente...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const entrevistaModel = app.get<Model<Entrevista>>(
    getModelToken(Entrevista.name),
  );

  try {
    // Crear entrevista usando el schema directamente
    const entrevistaData = {
      estudianteId: '507f1f77bcf86cd799439011',
      usuarioId: '507f1f77bcf86cd799439012',
      fecha: new Date(),
      nombre_Tutor: 'Psicólogo Test',
      año: 2024,
      numero_Entrevista: 1,
      duracion_minutos: 45,
      tipo_entrevista: 'academica',
      estado: 'completada',
      observaciones: 'Entrevista de prueba directa con MongoDB',
      temas_abordados: ['Test directo'],
      etiquetas: [],
    };

    const entrevistaCreada = await entrevistaModel.create(entrevistaData);
    console.log('✅ Entrevista creada directamente:', entrevistaCreada);

    // Consultar todas las entrevistas
    const todasLasEntrevistas = await entrevistaModel.find().exec();
    console.log('📋 Total entrevistas en BD:', todasLasEntrevistas.length);
  } catch (error) {
    console.error('❌ Error en prueba MongoDB directa:', error);
  } finally {
    await app.close();
    console.log('🔌 Conexión MongoDB cerrada');
  }
}

testMongoDBDirect();
