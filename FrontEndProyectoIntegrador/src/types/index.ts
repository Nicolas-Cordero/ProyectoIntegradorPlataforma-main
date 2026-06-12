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
  | 'CONDICIONAL'
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

  // Relaciones — solo se populan si el endpoint las incluye explícitamente
  liceo?: Liceo;
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
  rut_familiar: string;
  rut_estudiante: string;
  nombre: string;
  telefono: string;
  parentesco: Parentesco;
  observacion?: string;
  es_contacto_emergencia: boolean;
}

// ============================================

export interface Carrera {
  codigo_carrera: number;
  nombre: string;
  rut_estudiante: string;
  duracion_sem: number;
  codigo_universidad: number;
  via_acceso: 'ESPECIAL' | 'REGULAR' | 'PACE';
}

// ============================================

export type EstadoRamo = 'APROBADO' | 'REPROBADO' | 'CURSANDO' | 'ELIMINADO';

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
}

// ============================================

export interface ContactoEmergencia {
  id: number;
  id_familiar: number;
  rut_estudiante: string;
}

// ============================================

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
  descripcion?: string;
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

// ARCHIVOS LEGACY CON ERRORES TRAS LIMPIEZA (pendientes de corrección/eliminación):
// - src/components/features/estudiante-detalles/interview-workspace/DataTable.tsx
// - src/components/features/estudiante-detalles/interview-workspace/NoteEditor.tsx
// - src/components/features/estudiante-detalles/interview-workspace/TopNavbar.tsx

