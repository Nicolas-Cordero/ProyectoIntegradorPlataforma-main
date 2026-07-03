export const UserRol = {
  ADMIN:      'ADMIN',
  TUTOR:      'TUTOR',
  VISITA:     'VISITA',
  ESTUDIANTE: 'ESTUDIANTE',
} as const;

export type UserRolType = typeof UserRol[keyof typeof UserRol];

// ============================================

export type Genero = 'MASCULINO' | 'FEMENINO' | 'NO_BINARIO';

export type EstadoEstudiante =
  | 'ACTIVO'
  | 'ELIMINADO'
  | 'SUSPENDIDO'
  | 'RETIRADO'
  | 'EGRESADO'
  | 'TITULADO';

export const TipoBeneficio = {
  ARANCEL:    'ARANCEL',
  MANUTENCION: 'MANUTENCION',
} as const;

export type TipoBeneficio = typeof TipoBeneficio[keyof typeof TipoBeneficio];

// ============================================

export interface Usuario {
  rut_usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: UserRolType;
  activo?: boolean;
  must_change_password?: boolean;
  ultimo_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Estudiante {
  rut_estudiante: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  generacion_id: number;
  fecha_nacimiento: Date | string;
  direccion: string;
  genero: Genero;
  rbd_liceo: string;
  estado: EstadoEstudiante;
  promedios_media: number;
  puntaje_paes?: number;
  foto_url?: string;

  // Relaciones — solo se populan si el endpoint las incluye explícitamente.
  // /simple incluye: generacion_rel (parcial), liceo (solo nombre), carreras (solo nombre).
  // /complete incluye: generacion_rel (completo), liceo, paes, carreras con universidad,
  //   familiares (solo contactos de emergencia), beneficios, ramos.
  generacion_rel?: Generacion;
  liceo?: Liceo;
  paes?: Paes;
  familiares?: Familiar[];
  beneficios?: BeneficioEstudiante[];
  carreras?: Carrera[];
  ramos?: Ramo[];
  entrevistas?: Entrevista[];
  contactos_emergencia?: ContactoEmergencia[];
}

// ============================================

export interface Liceo {
  rbd: string;
  nombre: string;
  comuna: string;
  especialidad: string;
}

// ============================================

export type Parentesco =
  | 'PADRE' | 'MADRE'
  | 'ABUELO' | 'ABUELA'
  | 'HERMANO' | 'HERMANA'
  | 'TIO' | 'TIA'
  | 'PRIMO' | 'PRIMA'
  | 'OTRO';

export interface Familiar {
  id: number;
  rut_estudiante: string;
  nombre: string;
  telefono: string;
  parentesco: Parentesco;
  observacion?: string;
  es_contacto_emergencia: boolean;
}

// ============================================

export interface Universidad {
  codigo_universidad: number;
  nombre: string;
  comuna: string;
}

export interface Carrera {
  codigo_carrera: number;
  nombre: string;
  rut_estudiante: string;
  duracion_sem: number;
  codigo_universidad: number;
  via_acceso: 'ESPECIAL' | 'REGULAR' | 'PACE';
  estado: EstadoEstudiante;
  anio_ingreso: number;
  // Solo viene poblado desde /complete (findEstudianteByRutComplete incluye la relación).
  universidad?: Universidad;
}

// ============================================

export type EstadoRamo = 'APROBADO' | 'REPROBADO' | 'CURSANDO' | 'ELIMINADO';

export interface RamoSemestre {
  semestre_id: number;
  year: number;
  semestre: 'PRIMER_SEMESTRE' | 'SEGUNDO_SEMESTRE' | 'INVIERNO' | 'VERANO';
  tipo: 'REGULAR' | 'RECUPERATIVO';
}

export interface Ramo {
  id: number;
  semestre_id: number;
  rut_estudiante: string;
  codigo_carrera: number;
  nombre: string;
  estado: EstadoRamo;
  comentario: string;
  intento: number;
  nota_final?: number;
  // Solo viene poblado desde /complete (findEstudianteByRutComplete incluye la relación).
  semestre?: RamoSemestre;
}

// ============================================

export interface ContactoEmergencia {
  id: number;
  id_familiar: number;
  rut_estudiante: string;
}

// ============================================

export interface EntrevistaSemestre {
  semestre_id: number;
  year: number;
  semestre: string; // 'PRIMER_SEMESTRE' | 'SEGUNDO_SEMESTRE'
  tipo: string;
}

export interface Entrevista {
  id: number;
  fecha_hora: Date | string;
  rut_estudiante: string;
  semestre_id: number;
  duracion_s: number;
  rut_entrevistador: string;
  resumen?: string;
  created_at: Date | string;
  updated_at: Date | string;
  // relaciones (incluidas por el backend en listado y detalle)
  entrevistador?: { nombre: string; apellido: string };
  semestre?: EntrevistaSemestre;
  comentarios?: ComentarioEntrevista[];
}

// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

// ============================================

export interface Generacion {
  id: number;
  año: number;
  descripcion?: string | null;
  estudiantes?: Estudiante[];
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
  codigo_beneficio: number;
  nombre: string;
  proveedor: string;
  tipo: TipoBeneficio;
  descripcion: string;
  monto: number;
}

export interface BeneficioEstudiante {
  codigo_beneficio: number;
  rut_estudiante: string;
  estado: 'ACTIVO' | 'SUSPENDIDO' | 'FINALIZADO' | 'RECHAZADO' | 'EN_TRAMITE';
  inicio: Date | string;
  fin: Date | string;
}

// ============================================
// PAES
// ============================================

export interface Paes {
  id: number;
  rut_estudiante: string;
  matematicas: number;
  lenguaje: number;
  nem: number;
  ranking: number;
  matematicas2?: number;
  ciencias?: number;
  historia?: number;
}

// ============================================
// ENTREVISTAS
// ============================================

export type Topico = 'GENERAL' | 'ACADEMICO' | 'REL_INTER' | 'SALUD' | 'ACTS_EXTRA';

export const TOPICO_LABELS: Record<Topico, string> = {
  GENERAL:    'General',
  ACADEMICO:  'Académico',
  REL_INTER:  'Relaciones interpersonales',
  SALUD:      'Salud',
  ACTS_EXTRA: 'Actividades extracurriculares',
};

export const TODOS_LOS_TOPICOS: Topico[] = [
  'GENERAL', 'ACADEMICO', 'REL_INTER', 'SALUD', 'ACTS_EXTRA',
];

export interface ComentarioEntrevista {
  id: number;
  entrevista_id: number;
  topico: Topico;
  texto: string;
  created_at: string;
  updated_at: string;
}


