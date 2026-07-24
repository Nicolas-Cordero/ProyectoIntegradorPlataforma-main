// =====================================
// SERVICIO DE ESTUDIANTES
// =====================================

import { BaseHttpClient } from './base.http';
import type { Estudiante, Genero, Generacion } from '../types';

export interface CreateEstudianteDto {
  rut_estudiante: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  generacion_id: number;
  fecha_nacimiento: string; // ISO 8601, ej: "2000-03-15T00:00:00.000Z"
  direccion: string;
  genero: Genero;
  rbd_liceo: string;
  puntaje_paes?: number;
  foto_url?: string;
  promedios_media: number;
}

export interface UpdateEstudianteDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  generacion_id?: number;
  fecha_nacimiento?: string;
  direccion?: string;
  genero?: Genero;
  rbd_liceo?: string;
  puntaje_paes?: number;
  foto_url?: string;
  promedios_media?: number;
}

export interface CreateManyResult {
  creados: number;
}

class EstudianteService extends BaseHttpClient {

  async getAll(): Promise<Estudiante[]> {
    return await this.request<Estudiante[]>('/estudiante');
  }

  async getGenerations(): Promise<Generacion[]> {
    return await this.request<Generacion[]>('/generacion');
  }

  async getGeneracionById(id: number): Promise<Generacion> {
    return await this.request<Generacion>(`/generacion/${id}`);
  }

  async createGeneracion(data: { año: number; descripcion?: string }): Promise<Generacion> {
    return this.request<Generacion>('/generacion', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getById(rut_estudiante: string): Promise<Estudiante> {
    return await this.request<Estudiante>(`/estudiante/${rut_estudiante}/simple`);
  }

  async getByIdComplete(rut_estudiante: string): Promise<Estudiante> {
    return await this.request<Estudiante>(`/estudiante/${rut_estudiante}/complete`);
  }

  // Ruta corregida: /estudiante/generacion/:generacion_id (Int)
  // Acepta number o string (el valor se interpola en la URL de cualquier forma).
  async getByGeneracion(generacion_id: number | string): Promise<Estudiante[]> {
    return await this.request<Estudiante[]>(`/estudiante/generacion/${generacion_id}`);
  }

  async create(data: CreateEstudianteDto): Promise<Estudiante> {
    return this.request<Estudiante>('/estudiante', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Carga masiva transaccional: el backend crea TODOS los estudiantes o ninguno
  // (POST /estudiante/bulk). Si algo falla lanza el error con un mensaje
  // entendible; nunca deja una carga a medias.
  async createMany(data: CreateEstudianteDto[]): Promise<CreateManyResult> {
    return this.request<CreateManyResult>('/estudiante/bulk', {
      method: 'POST',
      body: JSON.stringify({ estudiantes: data }),
    });
  }

  async update(id: string, data: UpdateEstudianteDto): Promise<void> {
    return this.request<void>(`/estudiante/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(rut_estudiante: string): Promise<void> {
    return this.request<void>(`/estudiante/${rut_estudiante}`, {
      method: 'DELETE',
    });
  }
}

export const estudianteService = new EstudianteService();
