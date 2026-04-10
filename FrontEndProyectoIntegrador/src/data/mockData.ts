// DATOS MOCK CENTRALIZADOS
// Esta es la fuente única de verdad para todos los datos de estudiantes
// Todos los componentes deben importar desde aquí para mantener consistencia

export interface EstudianteMock {
  id: number;
  id_estudiante?: string;
  nombres: string;
  apellidos: string;
  nombre?: string; // Para compatibilidad
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  fecha_de_nacimiento?: string | Date;
  fecha_nacimiento?: string; // Para compatibilidad
  institucion?: { nombre_institucion: string };
  estado: string;
  año_generacion: number;
  carrera: string;
  liceo?: string;
  especialidad?: string;
  promedio_liceo?: number;
  universidad: string;
  duracion_carrera?: string;
  via_acceso?: string;
  semestre?: number;
  promedio?: number;
  beca?: string;
  region?: string;
  tipo_de_estudiante?: string;
}

// DATOS UNIFICADOS DE ESTUDIANTES (7 estudiantes para toda la app)
export const mockEstudiantes: EstudianteMock[] = [
  {
    id: 1,
    id_estudiante: 'EST001',
    nombres: 'Juan Carlos',
    apellidos: 'González Pérez',
    nombre: 'Juan Carlos González Pérez',
    rut: '12.345.678-9',
    email: 'juan.gonzalez@email.com',
    telefono: '+56 9 8765 4321',
    direccion: 'Av. Principal 123, Santiago',
    fecha_de_nacimiento: '1998-05-15',
    fecha_nacimiento: '1998-05-15',
    institucion: { nombre_institucion: 'Universidad de Chile' },
    estado: 'Estudiando',
    año_generacion: 2024,
    carrera: 'Ingeniería Civil',
    liceo: 'Liceo A-1 de Santiago',
    especialidad: 'Científico-Humanista',
    promedio_liceo: 6.5,
    universidad: 'Universidad de Chile',
    duracion_carrera: '6 años',
    via_acceso: 'PSU',
    semestre: 6,
    promedio: 6.2,
    beca: 'Beca de Excelencia Académica',
    region: 'Metropolitana',
    tipo_de_estudiante: 'UNIVERSITARIO'
  },
  {
    id: 2,
    id_estudiante: 'EST002',
    nombres: 'María Elena',
    apellidos: 'Rodríguez Silva',
    nombre: 'María Elena Rodríguez Silva',
    rut: '13.456.789-0',
    email: 'maria.rodriguez@email.com',
    telefono: '+56 9 7654 3210',
    direccion: 'Calle Secundaria 456, Valparaíso',
    fecha_de_nacimiento: '1999-03-22',
    fecha_nacimiento: '1999-03-22',
    institucion: { nombre_institucion: 'Pontificia Universidad Católica' },
    estado: 'Estudiando',
    año_generacion: 2024,
    carrera: 'Medicina',
    liceo: 'Carmela Carvajal',
    especialidad: 'Científico',
    promedio_liceo: 6.8,
    universidad: 'Pontificia Universidad Católica',
    duracion_carrera: '7 años',
    via_acceso: 'PSU',
    semestre: 8,
    promedio: 6.8,
    beca: 'Beca Mineduc',
    region: 'Valparaíso',
    tipo_de_estudiante: 'UNIVERSITARIO'
  },
  {
    id: 3,
    id_estudiante: 'EST003',
    nombres: 'Carlos Alberto',
    apellidos: 'Mendoza Ruiz',
    nombre: 'Carlos Alberto Mendoza Ruiz',
    rut: '14.567.890-1',
    email: 'carlos.mendoza@email.com',
    telefono: '+56 9 6543 2109',
    direccion: 'Pasaje Los Aromos 789, Concepción',
    fecha_de_nacimiento: '1997-11-08',
    fecha_nacimiento: '1997-11-08',
    institucion: { nombre_institucion: 'Universidad de Concepción' },
    estado: 'Estudiando',
    año_generacion: 2024,
    carrera: 'Psicología',
    liceo: 'Liceo Técnico de Concepción',
    especialidad: 'Técnico-Profesional',
    promedio_liceo: 6.0,
    universidad: 'Universidad de Concepción',
    duracion_carrera: '5 años',
    via_acceso: 'PSU',
    semestre: 4,
    promedio: 5.9,
    beca: 'Sin beca',
    region: 'Biobío',
    tipo_de_estudiante: 'UNIVERSITARIO'
  },
  {
    id: 4,
    id_estudiante: 'EST004',
    nombres: 'Ana Sofía',
    apellidos: 'Herrera López',
    nombre: 'Ana Sofía Herrera López',
    rut: '15.678.901-2',
    email: 'ana.herrera@email.com',
    telefono: '+56 9 5432 1098',
    direccion: 'Av. Libertad 321, La Serena',
    fecha_de_nacimiento: '2000-01-12',
    fecha_nacimiento: '2000-01-12',
    institucion: { nombre_institucion: 'Universidad de La Serena' },
    estado: 'Estudiando',
    año_generacion: 2024,
    carrera: 'Enfermería',
    liceo: 'Liceo Bicentenario de La Serena',
    especialidad: 'Científico-Humanista',
    promedio_liceo: 6.7,
    universidad: 'Universidad de La Serena',
    duracion_carrera: '5 años',
    via_acceso: 'PTU',
    semestre: 3,
    promedio: 6.4,
    beca: 'Beca Nuevo Milenio',
    region: 'Coquimbo',
    tipo_de_estudiante: 'UNIVERSITARIO'
  },
  {
    id: 5,
    id_estudiante: 'EST005',
    nombres: 'Diego Alejandro',
    apellidos: 'Vásquez Castro',
    nombre: 'Diego Alejandro Vásquez Castro',
    rut: '16.789.012-3',
    email: 'diego.vasquez@email.com',
    telefono: '+56 9 4321 0987',
    direccion: 'Calle Norte 654, Temuco',
    fecha_de_nacimiento: '1999-09-30',
    fecha_nacimiento: '1999-09-30',
    institucion: { nombre_institucion: 'Universidad de La Frontera' },
    estado: 'Estudiando',
    año_generacion: 2024,
    carrera: 'Agronomía',
    liceo: 'Liceo Agrícola de Temuco',
    especialidad: 'Técnico-Profesional',
    promedio_liceo: 6.3,
    universidad: 'Universidad de La Frontera',
    duracion_carrera: '5 años',
    via_acceso: 'PTU',
    semestre: 5,
    promedio: 6.1,
    beca: 'Beca Indígena',
    region: 'Araucanía',
    tipo_de_estudiante: 'UNIVERSITARIO'
  },
  {
    id: 6,
    id_estudiante: 'EST006',
    nombres: 'Valentina Isabel',
    apellidos: 'Morales Soto',
    nombre: 'Valentina Isabel Morales Soto',
    rut: '17.890.123-4',
    email: 'valentina.morales@email.com',
    telefono: '+56 9 3210 9876',
    direccion: 'Av. Central 987, Rancagua',
    fecha_de_nacimiento: '1998-12-03',
    fecha_nacimiento: '1998-12-03',
    institucion: { nombre_institucion: 'Universidad de O\'Higgins' },
    estado: 'Estudiando',
    año_generacion: 2024,
    carrera: 'Ingeniería en Minas',
    liceo: 'Liceo Industrial de Rancagua',
    especialidad: 'Técnico-Profesional',
    promedio_liceo: 6.4,
    universidad: 'Universidad de O\'Higgins',
    duracion_carrera: '6 años',
    via_acceso: 'PTU',
    semestre: 7,
    promedio: 6.3,
    beca: 'Beca de Excelencia Académica',
    region: 'O\'Higgins',
    tipo_de_estudiante: 'UNIVERSITARIO'
  },
  {
    id: 7,
    id_estudiante: 'EST007',
    nombres: 'Sebastián Andrés',
    apellidos: 'Torres Jiménez',
    nombre: 'Sebastián Andrés Torres Jiménez',
    rut: '18.901.234-5',
    email: 'sebastian.torres@email.com',
    telefono: '+56 9 2109 8765',
    direccion: 'Pasaje Sur 159, Puerto Montt',
    fecha_de_nacimiento: '2000-07-25',
    fecha_nacimiento: '2000-07-25',
    institucion: { nombre_institucion: 'Universidad Austral de Chile' },
    estado: 'Estudiando',
    año_generacion: 2024,
    carrera: 'Ingeniería en Acuicultura',
    liceo: 'Liceo Marítimo de Puerto Montt',
    especialidad: 'Técnico-Profesional',
    promedio_liceo: 6.1,
    universidad: 'Universidad Austral de Chile',
    duracion_carrera: '5 años',
    via_acceso: 'PTU',
    semestre: 2,
    promedio: 5.8,
    beca: 'Beca Vocación de Profesor',
    region: 'Los Lagos',
    tipo_de_estudiante: 'UNIVERSITARIO'
  }
];

// FUNCIÓN PARA BUSCAR ESTUDIANTE POR ID
export const encontrarEstudiantePorId = (id: string | number): EstudianteMock | undefined => {
  const idNumerico = typeof id === 'string' ? parseInt(id) : id;
  return mockEstudiantes.find(estudiante => estudiante.id === idNumerico);
};

// FUNCIÓN PARA OBTENER ESTUDIANTES POR GENERACIÓN
export const obtenerEstudiantesPorGeneracion = (año: number): EstudianteMock[] => {
  return mockEstudiantes.filter(estudiante => estudiante.año_generacion === año);
};

// DATOS DE GENERACIONES
export const mockGeneraciones = [
  {
    id: 1,
    año: 2024,
    nombre: 'Generación 2024',
    cantidad_estudiantes: 7,
    estado: 'Activa'
  },
  {
    id: 2,
    año: 2023,
    nombre: 'Generación 2023',
    cantidad_estudiantes: 0,
    estado: 'Finalizada'
  }
];