export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
  activo: boolean;
  ultimo_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  TUTOR = 'tutor',
  VISITA = 'visita'
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
  activo: boolean;
  ultimo_login?: Date;
  created_at: Date;
  updated_at: Date;
}