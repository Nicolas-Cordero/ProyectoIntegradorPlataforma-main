import { Estudiante } from './estudiante/entities/estudiante.entity';
import { Institucion } from './institucion/entities/institucion.entity';
import { AppDataSource } from './data-source';

async function seed() {
  const dataSource = AppDataSource;

  try {
    await dataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');

    // Crear institución de prueba
    const institucionRepository = dataSource.getRepository(Institucion);
    
    const institucion = institucionRepository.create({
      nombre: 'Universidad de Chile',
      tipo_institucion: 'Universidad',
      nivel_educativo: 'Superior',
      carrera_especialidad: 'Ingeniería Civil en Computación',
      duracion: '5 años',
      anio_de_ingreso: '2024',
      anio_de_egreso: '2029',
    });

    await institucionRepository.save(institucion);
    console.log('✅ Institución de prueba creada');

    // Crear estudiante de prueba
    const estudianteRepository = dataSource.getRepository(Estudiante);
    
    const estudiante = estudianteRepository.create({
      nombre: 'Juan Carlos Pérez González',
      rut: '12.345.678-9',
      fecha_de_nacimiento: new Date('2000-05-15'),
      generacion: '2024',
      tipo_de_estudiante: 'media' as any,
    });

    await estudianteRepository.save(estudiante);
    console.log('✅ Estudiante de prueba creado');
    console.log('👨‍🎓 Nombre: Juan Carlos Pérez González');
    console.log('🎓 RUT: 12.345.678-9');
    console.log('📅 Generación: 2024');
    console.log('📊 Status: ACTIVO');
    console.log('🎯 Tipo: MEDIA (por defecto)');

    await dataSource.destroy();
    console.log('✅ Seeder completado - Solo datos básicos necesarios');
  } catch (error) {
    console.error('❌ Error en el seeder:', error);
    process.exit(1);
  }
}

void seed();