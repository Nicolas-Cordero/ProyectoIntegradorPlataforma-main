import { UserRol } from "@prisma/client";


export interface User {
  rut_usuario: string;
  email: string;
  telefono: string
  password: string;
  nombre: string;
  apellido: string;
  rol: UserRol;
  ultimo_login?: Date;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: UserRol;
  activo: boolean;
  ultimo_login?: Date;
  created_at: Date;
  updated_at: Date;
}