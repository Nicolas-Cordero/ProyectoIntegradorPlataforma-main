// src/test-entities-mock.ts
import {
  Estudiante,
  TipoEstudiante,
} from './estudiante/entities/estudiante.entity';
import { Familia } from './familia/entities/familia.entity';
import { RamosCursados } from './ramos_cursados/entities/ramos_cursado.entity';
import { HistorialAcademico } from './historial_academico/entities/historial_academico.entity';
import { InformacionAcademica } from './informacion_academica/entities/informacion_academica.entity';
import { Institucion } from './institucion/entities/institucion.entity';

function testEntitiesStructure() {
  console.log('🔍 Validando estructura de entidades...\n');

  // 1. Crear institución mock
  const institucion = new Institucion();
  institucion.nombre = 'Universidad Test Mock';
  institucion.duracion = '4 años';
  institucion.anio_de_ingreso = '2023';
  institucion.anio_de_egreso = '2027';
  
  console.log('✅ Institución mock creada:', {
    nombre: institucion.nombre,
    duracion: institucion.duracion,
  });

  // 2. Crear estudiante mock
  const estudiante = new Estudiante();
  estudiante.nombre = 'Ana García Mock';
  estudiante.rut = '19.876.543-2';
  estudiante.telefono = '+56911223344';
  estudiante.fecha_de_nacimiento = new Date('1999-08-20');
  estudiante.email = 'ana.garcia@email.com';
  estudiante.tipo_de_estudiante = TipoEstudiante.UNIVERSITARIO;
  estudiante.institucion = institucion;

  console.log('✅ Estudiante mock creado:', {
    nombre: estudiante.nombre,
    tipo: estudiante.tipo_de_estudiante,
    institucion: estudiante.institucion.nombre,
  });

  // 3. Crear familia mock
  const familia = new Familia();
  familia.madre_nombre = 'Laura Martínez';
  familia.madre_edad = 42;
  familia.padre_nombre = 'Roberto García';
  familia.padre_edad = 46;
  familia.hermanos = [{ nombre: 'Carlos', edad: 15 }];
  familia.observaciones = { madre: [], padre: [], hermanos: [], general: [{ fecha: new Date().toISOString(), contenido: 'Familia mock de prueba' }] };
  familia.estudiante = estudiante;

  console.log('✅ Familia mock creada:', {
    madre: familia.madre_nombre,
    padre: familia.padre_nombre,
    hermanos: familia.hermanos.length,
  });

  // 4. Crear ramos mock
  const ramo1 = new RamosCursados();
  ramo1.semestre = 1;
  ramo1.nombre_ramo = 'Base de Datos';
  ramo1.notas_parciales = [75, 82, 79];
  ramo1.promedio_final = 78.67;
  ramo1.estado = 'aprobado';
  ramo1.nivel_educativo = 'Universitario';
  ramo1.estudiante = estudiante;

  const ramo2 = new RamosCursados();
  ramo2.semestre = 1;
  ramo2.nombre_ramo = 'Programación';
  ramo2.notas_parciales = [88, 91, 85];
  ramo2.promedio_final = 88.0;
  ramo2.estado = 'aprobado';
  ramo2.nivel_educativo = 'Universitario';
  ramo2.estudiante = estudiante;

  console.log('✅ Ramos mock creados:', [
    { ramo: ramo1.nombre_ramo, promedio: ramo1.promedio_final },
    { ramo: ramo2.nombre_ramo, promedio: ramo2.promedio_final },
  ]);

  // 5. Crear historial académico mock
  const historial = new HistorialAcademico();
  historial.año = 2024;
  historial.semestre = 1;
  historial.nivel_educativo = 'Universitario';
  historial.ramos_aprobados = 6;
  historial.ramos_reprobados = 0;
  historial.promedio_semestre = 85.5;
  historial.estudiante = estudiante;

  console.log('✅ Historial académico mock creado:', {
    periodo: `${historial.año}-${historial.semestre}`,
    aprobados: historial.ramos_aprobados,
    promedio: historial.promedio_semestre,
  });

  // 6. Crear información académica mock
  const infoAcademica = new InformacionAcademica();
  infoAcademica.promedio_media = 88.2;
  infoAcademica.via_acceso = 'PAES';
  infoAcademica.beneficios = { tipo: 'Beca Mérito', monto: 500000 };
  infoAcademica.status_actual = 'Activo';
  infoAcademica.estudiante = estudiante;

  console.log('✅ Información académica mock creada:', {
    promedio: infoAcademica.promedio_media,
    acceso: infoAcademica.via_acceso,
    status: infoAcademica.status_actual,
  });

  // 7. Validar relaciones
  console.log('\n🔗 Validando relaciones:');
  console.log(`   - Estudiante → Institución: ${estudiante.institucion ? '✅' : '❌'}`);
  console.log(`   - Familia → Estudiante: ${familia.estudiante ? '✅' : '❌'}`);
  console.log(`   - Ramo1 → Estudiante: ${ramo1.estudiante ? '✅' : '❌'}`);
  console.log(`   - Ramo2 → Estudiante: ${ramo2.estudiante ? '✅' : '❌'}`);
  console.log(`   - Historial → Estudiante: ${historial.estudiante ? '✅' : '❌'}`);
  console.log(`   - InfoAcadémica → Estudiante: ${infoAcademica.estudiante ? '✅' : '❌'}`);

  console.log('\n🎉 Test de entidades completado exitosamente!');
  console.log('💡 Para probar con base de datos real, asegúrate de:');
  console.log('   1. Tener PostgreSQL corriendo en puerto 5432');
  console.log('   2. Base de datos "proyecto_integrador" creada');
  console.log('   3. Usuario "postgres" con password "password"');
  console.log('   4. Ejecutar: npm run db:test');
}

// Ejecutar test de estructura
testEntitiesStructure();