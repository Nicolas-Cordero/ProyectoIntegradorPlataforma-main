export const UserRol = {
  ADMIN: 'ADMIN',
  ACADEMICO: 'ACADEMICO',
  ESTUDIANTE: 'ESTUDIANTE',
  TUTOR: 'TUTOR',
  INVITADO: 'INVITADO',
  VISITA: 'VISITA',
} as const;

export type UserRolType = typeof UserRol[keyof typeof UserRol];

// ============================================



// Tipos literales del backend
export type TipoEstudiante = 'media' | 'universitario';

export const TipoEstudiante = {
  MEDIA: 'media' as const,
  UNIVERSITARIO: 'universitario' as const,
};

export type StatusEstudiante = 'activo' | 'inactivo' | 'egresado' | 'retirado';

export const StatusEstudiante = {
  ACTIVO: 'activo' as const,
  INACTIVO: 'inactivo' as const,
  EGRESADO: 'egresado' as const,
  RETIRADO: 'retirado' as const,
};

export type Genero = 'MASCULINO' | 'FEMENINO' | 'NO_BINARIO';

export type EstadoEstudiante =
  | 'ACTIVO'
  | 'CONDICIONAL'
  | 'ELIMINADO'
  | 'SUSPENDIDO'
  | 'RETIRADO'
  | 'EGRESADO'
  | 'TITULADO';

export const TipoBeneficio = {
  BECA: 'BECA',
  CREDITO: 'CREDITO',
  GRATUIDAD: 'GRATUIDAD',
  BENEFICIO_ESTATAL: 'BENEFICIO_ESTATAL',
} as const;

export type TipoBeneficio = typeof TipoBeneficio[keyof typeof TipoBeneficio];

// ============================================

export interface Usuario {
  nombre?: string;
  apellido?: string;
  rut_usuario: string;
  email: string;
  rol?: UserRolType;
  password?: string;
  telefono?: string;
  ultimo_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Estudiante {
  // Clave primaria
  rut_estudiante: string;

  // Campos requeridos
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  generacion: string;
  fecha_nacimiento: Date | string;
  direccion: string;
  genero: Genero;
  rbd_liceo: string;
  estado: EstadoEstudiante;
  promedios_media: number;

  // Campos opcionales
  puntaje_paes?: number;
  foto_url?: string;

  // Relaciones (opcionales porque la API puede no incluirlas siempre)
  liceo?: Liceo;
  familiares?: Familiar[];
  beneficios?: BeneficioEstudiante[];
  carreras?: Carrera[];
  ramos?: Ramo[];
  entrevistas?: Entrevista[];
  contactos_emergencia?: ContactoEmergencia[];
}

// ============================================

export interface Institucion {
  id_institucion?: string;
  nombre?: string;
  tipo_institucion?: string;
  nivel_educativo?: string;
  carrera_especialidad?: string;
  duracion?: string;
  anio_de_ingreso?: string | number;
  anio_de_egreso?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  
  // Compatibilidad
  id?: string;
  nombre_institucion?: string;
  tipo?: string;
  activo?: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

// ============================================

export interface Familia {
  id_familia: string | number;
  
  // === CAMPOS MIGRADOS (usar familiarService) ===
  // nombre_madre, descripcion_madre -> familiar con tipo_familiar_id = MADRE
  // nombre_padre, descripcion_padre -> familiar con tipo_familiar_id = PADRE
  // hermanos -> familiar con tipo_familiar_id = HERMANO
  // otros_familiares -> familiar con tipo_familiar_id = OTRO
  
  nombre_madre?: string;
  descripcion_madre?: string[];
  nombre_padre?: string;
  descripcion_padre?: string[];
  hermanos?: any[];
  observaciones_hermanos?: string;
  otros_familiares?: any[];
  observaciones_otros_familiares?: string;
  observaciones?: any;
  estudiante?: Estudiante;
  created_at?: Date;
  updated_at?: Date;
}

// ============================================

export interface RamosCursados {
  id_ramos_cursados: string;
  
  // === CAMPOS MIGRADOS ===
  // año, semestre -> usar periodoAcademicoService y periodo_academico_estudiante_id
  periodo_academico_estudiante_id?: number;
  
  oportunidad?: number;
  codigo_ramo?: string;
  nombre_ramo: string;
  notas_parciales: number[];
  promedio_final: number;
  estado: string;
  comentarios?: string;
  nivel_educativo: string;
  estudiante?: Estudiante;
}

// ============================================

export interface HistorialAcademico {
  id_historial_academico: string;
  
  // === CAMPOS MIGRADOS ===
  // año, semestre -> usar periodoAcademicoService
  
  nivel_educativo?: string;
  ramos_aprobados?: number;
  ramos_reprobados?: number;
  ramos_eliminados?: number;
  promedio_semestre?: number;
  trayectoria_academica?: string[];
  observaciones?: string;
  ultima_actualizacion_por?: string;
  estudiante?: Estudiante;
  created_at?: Date;
  updated_at?: Date;
}

// ============================================

export interface InformacionAcademica {
  id_info_academico?: number;
  promedio_1?: number;
  promedio_2?: number;
  promedio_3?: number;
  promedio_4?: number;
  promedio_acumulado?: number;
  via_acceso?: string;
  año_ingreso_beca?: number;
  colegio?: string;
  especialidad_colegio?: string;
  comuna_colegio?: string;
  
  // === CAMPOS MIGRADOS ===
  // puntajes_admision -> usar informacionAdmisionService
  // ensayos_paes -> usar informacionAdmisionService / ensayoPaesService
  // puntajes_paes es alias de puntajes_admision (deprecado)
  
  beneficios?: string;
  resumen_semestres?: any;
  ultima_actualizacion_por?: string;
  estudiante?: Estudiante;
  created_at?: Date;
  updated_at?: Date;
}
// ============================================

export interface Liceo {
  rbd: string;
  nombre: string;
  direccion?: string;
  comuna?: string;
  region?: string;
  telefono?: string;
  email?: string;
}

// ============================================

export interface Familiar {
  id: number;
  rut_estudiante: string;
  nombre: string;
  apellido: string;
  parentesco: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  observaciones?: string;
}

// ============================================

export interface Carrera {
  id: number;
  rut_estudiante: string;
  nombre_carrera: string;
  institucion?: string;
  año_ingreso?: number;
  año_egreso?: number;
  activa: boolean;
  observaciones?: string;
}

// ============================================

export interface Ramo {
  id: number;
  rut_estudiante: string;
  nombre: string;
  codigo?: string;
  semestre?: number;
  año?: number;
  nota?: number;
  estado: EstadoRamo;
}

export type EstadoRamo = 'APROBADO' | 'REPROBADO' | 'CURSANDO' | 'ELIMINADO';

// ============================================

export interface ContactoEmergencia {
  id: number;
  rut_estudiante: string;
  nombre: string;
  apellido: string;
  parentesco?: string;
  telefono: string;
  email?: string;
}

// ============================================

export interface Entrevista {
  id: string;
  estudianteId: string;
  usuarioId: string;
  fecha: Date;
  nombre_Tutor: string;
  año: number;
  numero_Entrevista: number;
  duracion_minutos: number;
  estado: string;
  observaciones?: string;
  informacion_adicional?: string;
  temas_abordados: string[];
  etiquetas: EtiquetaEntrevista[];
  textos: TextoEtiqueta[];
}

export interface EtiquetaEntrevista {
  nombre_etiqueta: string;
  textos: TextoEtiqueta[];
  primera_vez: Date;
  ultima_vez: Date;
  frecuencia: number;
}

export interface TextoEtiqueta {
  contenido: string;
  fecha: Date;
  contexto: string;
}

// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Usuario;
}

// ============================================

export interface EstadisticasAdmin {
  generacionesTotal: number;
  estudiantesTotal: number;
  generaciones: Array<{
    generacion: string;
    total: number;
  }>;
  total_usuarios?: number;
  total_estudiantes?: number;
  total_academicos?: number;
  total_instituciones?: number;
  total_asignaturas?: number;
  total_reportes?: number;
  estudiantes_por_tipo?: {
    ESCOLAR: number;
    UNIVERSITARIO: number;
    EGRESADO: number;
  };
  promedio_general?: number;
  total_entrevistas?: number;
  total_familias?: number;
}

// ============================================

export interface Generacion {
  año: number;
  estudiantes: Estudiante[];
  cantidadEstudiantes: number;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

// ============================================
// BENEFICIOS
// ============================================

export interface Beneficio {
  id: number;
  nombre: string;
  codigo: string;
  tipo?: TipoBeneficio;
  descripcion?: string;
  activo: boolean;
}

export interface BeneficioEstudiante {
  id: number;
  estudiante_id: string;
  beneficio_id: number;
  beneficio?: Beneficio;
  anio_inicio: number;
  anio_termino?: number;
  activo: boolean;
  observaciones?: string;
  created_at: Date | string;
}

// ============================================
// INFORMACION DE ADMISION
// ============================================

export interface InformacionAdmision {
  id: number;
  estudiante_id: string;
  via_acceso?: string;
  anio_ingreso?: number;
  colegio?: string;
  especialidad_colegio?: string;
  comuna_colegio?: string;
  puntaje_nem?: number;
  puntaje_ranking?: number;
  puntaje_lenguaje?: number;
  puntaje_matematicas?: number;
  puntaje_ciencias?: number;
  puntaje_historia?: number;
  promedio_notas?: number;
  observaciones?: string;
  created_at: Date | string;
  updated_at: Date | string;
  ensayos_paes?: EnsayoPaes[];
}

export interface EnsayoPaes {
  id: number;
  estudiante_id: string;
  admision_id?: number;
  anio: number;
  mes?: number;
  institucion?: string;
  puntaje_lenguaje?: number;
  puntaje_matematicas?: number;
  puntaje_ciencias?: number;
  puntaje_historia?: number;
  observaciones?: string;
  created_at: Date | string;
}

// ============================================
// PERIODO ACADEMICO ESTUDIANTE
// ============================================

export interface PeriodoAcademicoEstudiante {
  id: number;
  estudiante_id: string;
  periodo_academico_id: number;
  institucion_id?: number;
  promedio?: number;
  creditos_aprobados?: number;
  creditos_reprobados?: number;
  observaciones?: string;
  created_at: Date | string;
  periodo_academico?: PeriodoAcademico;
  institucion?: Institucion;
}

export interface PeriodoAcademico {
  id: number;
  anio: number;
  semestre: number;
  fecha_inicio?: Date | string;
  fecha_fin?: Date | string;
  activo: boolean;
}
