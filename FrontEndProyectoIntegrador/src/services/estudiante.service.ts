// =====================================
// SERVICIO DE ESTUDIANTES
// =====================================

import { BaseHttpClient } from './base.http';
import type { Estudiante } from '../types';

/**
 * Interfaz para crear un nuevo estudiante
 * Campos opcionales: email, telefono, direccion (se crean automáticamente en informacion_contacto)
 */
export interface CreateEstudianteDto {
  nombre: string;
  rut: string;
  fecha_de_nacimiento: string;
  tipo_de_estudiante: 'media' | 'universitario';
  genero?: string;
  generacion?: string;
  id_institucion?: string;
  numero_carrera?: number;
  observaciones?: string;
  // Campos de contacto (opcionales, se crean en informacion_contacto)
  email?: string;
  telefono?: string;
  direccion?: string;
}

/**
 * Interfaz para actualizar un estudiante existente
 */
export interface UpdateEstudianteDto {
  nombre?: string;
  rut?: string;
  fecha_de_nacimiento?: string;
  tipo_de_estudiante?: 'media' | 'universitario';
  genero?: string;
  generacion?: string;
  id_institucion?: string;
  numero_carrera?: number;
  observaciones?: string;
  foto_url?: string;
}

class EstudianteService extends BaseHttpClient {
  
  /**
   * Obtener todos los estudiantes
   */
  async getAll(): Promise<Estudiante[]> {
    return await this.request<Estudiante[]>('/estudiante');
  }

  /**
   * Obtener estudiante por ID
   */
  async getById(id: string): Promise<Estudiante> {
    return await this.request<Estudiante>(`/estudiante/${id}`);
  }

  /**
   * Obtener estudiantes por generación
   */
  async getByGeneracion(generacion: string): Promise<Estudiante[]> {
    return await this.request<Estudiante[]>(`/estudiante/generacion/${generacion}`);
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
    return await this.request('/estudiante/estadisticas');
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
   * Eliminar estudiante
   */
  async delete(id: string): Promise<void> {
    return this.request<void>(`/estudiante/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // MÉTODOS LEGACY (deprecados - usar servicios especializados)
  // ============================================

  /**
   * @deprecated Usar familiarService para actualizar información familiar
   */
  async updateFamiliaInfo(idEstudiante: string, data: {
    mama?: { nombre: string; edad: string; observaciones: string };
    papa?: { nombre: string; edad: string; observaciones: string };
    hermanos?: { nombres: string; observaciones: string };
    otros_familiares?: { nombres: string; observaciones: string };
    observaciones_generales?: string;
  }) {
    console.warn('⚠️ updateFamiliaInfo está deprecado. Usar familiarService en su lugar.');
    return this.request(`/estudiante/${idEstudiante}/familia`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const estudianteService = new EstudianteService();
