// src/test/full-database.test.ts
import { AppDataSource } from '../data-source';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import {
  Estudiante,
  TipoEstudiante,
} from '../estudiante/entities/estudiante.entity';
import { Familia } from '../familia/entities/familia.entity';
import { RamosCursados } from '../ramos_cursados/entities/ramos_cursado.entity';
import { HistorialAcademico } from '../historial_academico/entities/historial_academico.entity';
import { InformacionAcademica } from '../informacion_academica/entities/informacion_academica.entity';
import { Institucion } from '../institucion/entities/institucion.entity';
import { Entrevista } from '../entrevistas/schemas/entrevista.schema';

async function testFullDatabase() {
  console.log('[INICIO] Iniciando prueba completa de bases de datos...\n');

  // 1. Probar PostgreSQL
  await testPostgreSQL();

  // 2. Probar MongoDB
  await testMongoDB();

  console.log('\n[FIN] Prueba completa finalizada\n');
}

async function testPostgreSQL() {
  try {
    console.log('[PostgreSQL] Iniciando pruebas...');

    await AppDataSource.initialize();
    console.log('[OK] Conexión establecida');

    // Limpiar datos existentes
    await clearDatabase();
    console.log('[OK] Base de datos limpiada');

    // 1. CRUD Institución
    console.log('\n[TEST] Probando CRUD de Institución...');
    const institucion = new Institucion();
    institucion.nombre = 'Universidad de Prueba';
    //institucion.tipo_institucion = 'Universidad';
    //institucion.nivel_educativo = 'Superior';
    //institucion.carrera_especialidad = 'Ingeniería';
    institucion.anio_de_ingreso = '2023';
    institucion.anio_de_egreso = '2027';

    const institucionGuardada = await AppDataSource.manager.save(institucion);
    console.log('  ✓ Crear: ID:', institucionGuardada.id_institucion);

    const institucionLeida = await AppDataSource.manager.findOne(Institucion, {
      where: { id_institucion: institucionGuardada.id_institucion },
    });
    console.log('  ✓ Leer:', institucionLeida?.nombre);

    institucionLeida!.nombre = 'Universidad Actualizada';
    await AppDataSource.manager.save(institucionLeida!);
    console.log('  ✓ Actualizar');

    // 2. CRUD Estudiante con relaciones
    console.log('\n[TEST] Probando CRUD de Estudiante...');
    const estudiante = new Estudiante();
    estudiante.nombre = 'Juan Pérez';
    estudiante.rut = '12.345.678-9';
    estudiante.telefono = '+56912345678';
    estudiante.fecha_de_nacimiento = new Date('2000-01-01');
    estudiante.email = 'juan.perez@test.com';
    estudiante.tipo_de_estudiante = TipoEstudiante.UNIVERSITARIO;
    estudiante.institucion = institucionGuardada;

    const estudianteGuardado = await AppDataSource.manager.save(estudiante);
    console.log('  ✓ Crear: ID:', estudianteGuardado.id_estudiante);

    // 3. Crear entidades relacionadas
    console.log('\n[TEST] Creando entidades relacionadas...');

    // Familia
    const familia = new Familia();
    familia.madre_nombre = 'María';
    familia.madre_edad = 45;
    familia.padre_nombre = 'José';
    familia.padre_edad = 47;
    familia.hermanos = [{ nombre: 'Ana', edad: 15 }];
    //familia.observaciones = 'Familia de prueba';
    familia.estudiante = estudianteGuardado;
    await AppDataSource.manager.save(familia);
    console.log('  ✓ Familia creada');

    // Ramos
    const ramo = new RamosCursados();
    ramo.semestre = 1;
    ramo.nombre_ramo = 'Cálculo';
    ramo.notas_parciales = [70, 80, 90];
    ramo.promedio_final = 80;
    ramo.estado = 'aprobado';
    ramo.nivel_educativo = 'Universitario';
    ramo.estudiante = estudianteGuardado;
    await AppDataSource.manager.save(ramo);
    console.log('  ✓ Ramo creado');

    // Historial
    const historial = new HistorialAcademico();
    historial.año = 2023;
    historial.semestre = 2;
    historial.nivel_educativo = 'Universitario';
    historial.ramos_aprobados = 5;
    historial.ramos_reprobados = 0;
    historial.promedio_semestre = 85.5;
    historial.estudiante = estudianteGuardado;
    await AppDataSource.manager.save(historial);
    console.log('  ✓ Historial creado');

    // Info Académica
    const info = new InformacionAcademica();
    info.promedio_media = 65.5;
    info.via_acceso = 'PSU';
    info.beneficios = { tipo: 'Beca', monto: 1000000 };
    info.status_actual = 'Activo';
    info.estudiante = estudianteGuardado;
    await AppDataSource.manager.save(info);
    console.log('  ✓ Info académica creada');

    // 4. Probar consultas complejas
    console.log('\n[TEST] Ejecutando consultas complejas...');

    // Estudiante con todas sus relaciones
    const estudianteCompleto = await AppDataSource.manager.findOne(Estudiante, {
      where: { id_estudiante: estudianteGuardado.id_estudiante },
      relations: [
        'institucion',
        'familia',
        'ramosCursados',
        'historialesAcademicos',
        'informacionAcademica',
      ],
    });

    console.log('  ✓ Estudiante cargado con relaciones:');
    console.log(`    - Nombre: ${estudianteCompleto?.nombre}`);
    console.log(`    - Institución: ${estudianteCompleto?.institucion.nombre}`);
    console.log(`    - Familia: ${estudianteCompleto?.familia?.madre_nombre}`);
    console.log(`    - Ramos: ${estudianteCompleto?.ramosCursados?.length}`);
    console.log(
      `    - Historiales: ${estudianteCompleto?.historialesAcademicos?.length}`,
    );
    console.log(
      `    - Info Académica: ${estudianteCompleto?.informacionAcademica?.promedio_media}`,
    );

    console.log('\n[OK] Pruebas PostgreSQL completadas con éxito');
  } catch (error) {
    console.error('[ERROR] Error en pruebas PostgreSQL:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('[INFO] Conexión PostgreSQL cerrada');
    }
  }
}

async function testMongoDB() {
  console.log('\n[MongoDB] Iniciando pruebas...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const entrevistaModel = app.get<Model<Entrevista>>(
    getModelToken(Entrevista.name),
  );

  try {
    // Limpiar colección
    await entrevistaModel.deleteMany({});
    console.log('[OK] Colección limpiada');

    // 1. Crear entrevista
    const entrevistaData = {
      estudianteId: '507f1f77bcf86cd799439011', // ID ejemplo
      usuarioId: '507f1f77bcf86cd799439012', // ID ejemplo
      fecha: new Date(),
      nombre_Tutor: 'Dr. Smith',
      año: 2023,
      numero_Entrevista: 1,
      duracion_minutos: 60,
      tipo_entrevista: 'seguimiento',
      estado: 'completada',
      observaciones: 'Primera entrevista de prueba',
      temas_abordados: ['Rendimiento académico', 'Adaptación universitaria'],
      etiquetas: [
        {
          nombre_etiqueta: 'Académico',
          textos: [
            {
              contenido: 'Buen desempeño en matemáticas',
              fecha: new Date(),
              contexto: 'Evaluación inicial',
            },
          ],
          primera_vez: new Date(),
          ultima_vez: new Date(),
          frecuencia: 1,
        },
      ],
    };

    const entrevistaCreada = await entrevistaModel.create(entrevistaData);
    console.log('  ✓ Crear: ID:', entrevistaCreada._id);

    // 2. Leer entrevista
    const entrevistaLeida = await entrevistaModel.findById(entrevistaCreada._id);
    console.log('  ✓ Leer:', entrevistaLeida?.nombre_Tutor);

    // 3. Actualizar entrevista
    await entrevistaModel.findByIdAndUpdate(entrevistaCreada._id, {
      $set: { observaciones: 'Observación actualizada' },
    });
    console.log('  ✓ Actualizar');

    // 4. Consultas agregadas
    const stats = await entrevistaModel.aggregate([
      {
        $group: {
          _id: '$tipo_entrevista',
          count: { $sum: 1 },
          duracionPromedio: { $avg: '$duracion_minutos' },
        },
      },
    ]);
    console.log('  ✓ Estadísticas por tipo:', stats);

    // 5. Eliminar entrevista
    await entrevistaModel.findByIdAndDelete(entrevistaCreada._id);
    console.log('  ✓ Eliminar');

    console.log('\n[OK] Pruebas MongoDB completadas con éxito');
  } catch (error) {
    console.error('[ERROR] Error en pruebas MongoDB:', error);
  } finally {
    await app.close();
    console.log('[INFO] Conexión MongoDB cerrada');
  }
}

async function clearDatabase() {
  try {
    await AppDataSource.manager.clear(InformacionAcademica);
    await AppDataSource.manager.clear(HistorialAcademico);
    await AppDataSource.manager.clear(RamosCursados);
    await AppDataSource.manager.clear(Familia);
    await AppDataSource.manager.clear(Estudiante);
    await AppDataSource.manager.clear(Institucion);
  } catch (error) {
    console.error('⚠️ Error al limpiar la base de datos:', error);
  }
}

// Ejecutar pruebas
testFullDatabase().catch((e) => {
    console.error('[ERROR] Error general:', e);
  process.exit(1);
});