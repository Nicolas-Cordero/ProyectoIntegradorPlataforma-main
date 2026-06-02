// =====================================
// SERVICIO DE ESTUDIANTES
// =====================================

import { BaseHttpClient } from './base.http';
import type { Estudiante, Genero, EstadoEstudiante, Generacion } from '../types';

/**
 * Interfaz para crear un nuevo estudiante (alineada al backend CreateEstudianteDto)
 */
export interface CreateEstudianteDto {
  rut_estudiante: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  generacion: string;
  fecha_nacimiento: string;
  direccion: string;
  genero: Genero;
  rbd_liceo: string;
  puntaje_paes?: number;
  foto_url?: string;
  promedios_media: number;
  estado: EstadoEstudiante;
}

/**
 * Interfaz para actualizar un estudiante existente (alineada al backend UpdateEstudianteDto)
 */
export interface UpdateEstudianteDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  generacion?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  genero?: Genero;
  rbd_liceo?: string;
  puntaje_paes?: number;
  foto_url?: string;
  promedios_media?: number;
  estado?: EstadoEstudiante;
}

class EstudianteService extends BaseHttpClient {
  
  /**
   * Obtener todos los estudiantes
   */
  async getAll(): Promise<Estudiante[]> {
    return await this.request<Estudiante[]>('/estudiante');
  }

  async getGenerations(): Promise<Generacion[]> {
    return await this.request<Generacion[]>('/generacion');
  }

  /**
   * Obtener estudiante por RUT (simple, sin relaciones)
   */
  async getById(rut_estudiante: string): Promise<Estudiante> {
    return await this.request<Estudiante>(`/estudiante/${rut_estudiante}/simple`);
  }

  /**
   * Obtener estudiante por RUT (completo, con relaciones)
   */
  async getByIdComplete(rut_estudiante: string): Promise<Estudiante> {
    return await this.request<Estudiante>(`/estudiante/${rut_estudiante}/complete`);
  }

  /**
   * Obtener estudiantes por generación
   * Usa la ruta correcta del backend: /estudiante/generaciones/:generation
   */
  async getByGeneracion(generacion: string): Promise<Estudiante[]> {
    return await this.request<Estudiante[]>(`/estudiante/generaciones/${generacion}`);
  }

  /**
   * Obtener estadísticas de estudiantes
   */
  async getEstadisticas(): Promise<{
    generacionesTotal: number;
    estudiantesTotal: number;
    activosTotal: number;
    generaciones: Array<{
      generacion: string;
      total: number;
      activos: number;
    }>;
  }> {
    return await this.request('/estudiante/');
  }

  /**
   * Crear nuevo estudiante
   * Los campos email, telefono y direccion se crean automáticamente en informacion_contacto
   * Se crea automáticamente un registro en estado_academico con status 'activo'
   */
  async create(data: CreateEstudianteDto): Promise<Estudiante> {
    return this.request<Estudiante>('/estudiante', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Actualizar estudiante existente
   * NOTA: Para actualizar email, telefono o direccion, usar informacionContactoService
   * Para actualizar status académico, usar estadoAcademicoService
   */
  async update(id: string, data: UpdateEstudianteDto): Promise<void> {
    return this.request<void>(`/estudiante/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Eliminar estudiante por RUT
   */
  async delete(rut_estudiante: string): Promise<void> {
    return this.request<void>(`/estudiante/${rut_estudiante}`, {
      method: 'DELETE',
    });
  }
}

export const estudianteService = new EstudianteService();
