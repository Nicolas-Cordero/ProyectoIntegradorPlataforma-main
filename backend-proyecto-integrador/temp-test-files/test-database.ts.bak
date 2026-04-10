// src/test-database.ts
import { AppDataSource } from './data-source';
import {
  Estudiante,
  TipoEstudiante,
} from './estudiante/entities/estudiante.entity';
import { Familia } from './familia/entities/familia.entity';
import { RamosCursados } from './ramos_cursados/entities/ramos_cursado.entity';
import { HistorialAcademico } from './historial_academico/entities/historial_academico.entity';
import { InformacionAcademica } from './informacion_academica/entities/informacion_academica.entity';
import { Institucion } from './institucion/entities/institucion.entity';

async function testSQL() {
  try {
  console.log('[INFO] Inicializando conexión a la base de datos (PostgreSQL)...');

    await AppDataSource.initialize();
  console.log('[OK] Conexión a PostgreSQL establecida');

    // Limpiar datos existentes
    await clearDatabase();

    // 1. Crear institución
    const institucion = new Institucion();
    institucion.nombre = 'Universidad Test SQL';
    institucion.duracion = '4 años';
    institucion.anio_de_ingreso = '2023';
    institucion.anio_de_egreso = '2027';

    const institucionGuardada = await AppDataSource.manager.save(institucion);
    console.log('Institución creada:', institucionGuardada.id_institucion);

    // 2. Crear estudiante
    const estudiante = new Estudiante();
      estudiante.nombre = 'Ana García SQL';
    estudiante.rut = '19.876.543-2';
    estudiante.telefono = '+56911223344';
    estudiante.fecha_de_nacimiento = new Date('1999-08-20');
    estudiante.email = 'ana.garcia@email.com';
    estudiante.tipo_de_estudiante = TipoEstudiante.UNIVERSITARIO;
    estudiante.institucion = institucionGuardada;

    const estudianteGuardado = await AppDataSource.manager.save(estudiante);
    console.log('[OK] Estudiante creado:', estudianteGuardado.id_estudiante);

    // 3. Crear familia - USANDO APPROACH DIFERENTE
    console.log('[INFO] Creando Familia...');
    const familiaData = {
      madre_nombre: 'Laura Martínez',
      madre_edad: 42,
      padre_nombre: 'Roberto García',
      padre_edad: 46,
      hermanos: [{ nombre: 'Carlos', edad: 15 }],
      observaciones: { madre: [], padre: [], hermanos: [], general: [{ fecha: new Date().toISOString(), contenido: 'Familia con PostgreSQL' }] },
      // No incluimos estudiante ni id_estudiante aquí
    };

    const familiaRepository = AppDataSource.getRepository(Familia);
    await familiaRepository.save(
      familiaRepository.create({
        ...familiaData,
        estudiante: estudianteGuardado,
      }),
    );
    console.log('Familia creada y asociada al estudiante');

    // 4. Crear ramos - USANDO APPROACH SIMILAR
    console.log('Creando Ramos...');
    const ramosRepository = AppDataSource.getRepository(RamosCursados);

    const ramosData = [
      {
        semestre: 1,
        nombre_ramo: 'Base de Datos',
        notas_parciales: [75, 82, 79],
        promedio_final: 78.7,
        estado: 'aprobado',
        nivel_educativo: 'Universitario',
      },
      {
        semestre: 1,
        nombre_ramo: 'Programación',
        notas_parciales: [88, 91, 85],
        promedio_final: 88.0,
        estado: 'aprobado',
        nivel_educativo: 'Universitario',
      },
    ];

    for (const ramoData of ramosData) {
      await ramosRepository.save(
        ramosRepository.create({ ...ramoData, estudiante: estudianteGuardado }),
      );
      console.log(`Ramo creado: ${ramoData.nombre_ramo}`);
    }

    // 5. Crear historial académico
    console.log('Creando Historial Académico...');
    const historialRepository = AppDataSource.getRepository(HistorialAcademico);

    await historialRepository.save(
      historialRepository.create({
        año: 2024,
        semestre: 1,
        nivel_educativo: 'Universitario',
        ramos_aprobados: 6,
        ramos_reprobados: 0,
        promedio_semestre: 85.5,
        estudiante: estudianteGuardado,
      }),
    );

    console.log('[OK] Historial creado');

    // 6. Crear información académica
    console.log('[INFO] Creando Información Académica...');
    const infoRepository = AppDataSource.getRepository(InformacionAcademica);

    await infoRepository.save(
      infoRepository.create({
        promedio_media: 88.2,
        via_acceso: 'PAES',
        beneficios: { tipo: 'Beca Mérito', monto: 500000 },
        status_actual: 'Activo',
        estudiante: estudianteGuardado,
      }),
    );

    console.log('[OK] Información académica creada');

    console.log('[OK] Datos de prueba creados exitosamente!');

    // Test de consultas básicas
    await testBasicQueries();
  } catch (error) {
    console.error('[ERROR] Error en prueba SQL:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
  console.log('[INFO] Conexión PostgreSQL cerrada');
    }
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
    console.log('[OK] Base de datos limpiada');
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log('[WARN] No se pudieron limpiar todos los datos:', msg);
  }
}

async function testBasicQueries() {
  console.log('\n[TEST] Probando consultas básicas...');

  try {
    // Consultar conteo de registros
    const counts = await Promise.all([
      AppDataSource.manager.count(Institucion),
      AppDataSource.manager.count(Estudiante),
      AppDataSource.manager.count(Familia),
      AppDataSource.manager.count(RamosCursados),
      AppDataSource.manager.count(HistorialAcademico),
      AppDataSource.manager.count(InformacionAcademica),
    ]);

    console.log('[INFO] Estadísticas de la base de datos:');
    console.log(`   Instituciones: ${counts[0]}`);
    console.log(`   Estudiantes: ${counts[1]}`);
    console.log(`   Familias: ${counts[2]}`);
    console.log(`   Ramos: ${counts[3]}`);
    console.log(`   Historiales: ${counts[4]}`);
    console.log(`   Info Académica: ${counts[5]}`);

    // Consultar estudiantes
    const estudiantes = await AppDataSource.manager.find(Estudiante, {
      relations: ['institucion'],
    });

    if (estudiantes.length > 0) {
      console.log('\n[INFO] Estudiantes creados:');
      estudiantes.forEach((est) => {
        console.log(`   - ${est.nombre} (${est.institucion.nombre})`);
      });
    }
  } catch (error) {
    console.error('[ERROR] Error en las consultas:', error);
  }
}

// Ejecutar prueba
testSQL().catch((e) => {
  console.error('[ERROR] Error general al ejecutar test SQL:', e);
});
