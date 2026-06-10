// =====================================
// SERVICIO DE ESTUDIANTES
// =====================================

import { BaseHttpClient } from './base.http';
import type { Estudiante, Genero, EstadoEstudiante, Generacion } from '../types';

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
  estado: EstadoEstudiante;
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
  estado?: EstadoEstudiante;
}

export interface CreateManyResult {
  creados: number;
  errores: { rut: string; motivo: string }[];
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

  // Crea múltiples estudiantes secuencialmente (no hay endpoint batch en el backend)
  async createMany(data: CreateEstudianteDto[]): Promise<CreateManyResult> {
    let creados = 0;
    const errores: { rut: string; motivo: string }[] = [];

    for (const dto of data) {
      try {
        await this.create(dto);
        creados++;
      } catch (err: any) {
        errores.push({
          rut: dto.rut_estudiante,
          motivo: err?.message ?? 'Error desconocido',
        });
      }
    }

    return { creados, errores };
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
