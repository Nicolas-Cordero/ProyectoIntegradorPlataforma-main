import { BaseHttpClient } from './base.http';
import type { Beneficio, BeneficioEstudiante } from '../types';

/**
 * Servicio para gestionar beneficios y beneficios de estudiantes
 */
class BeneficiosService extends BaseHttpClient {
  // ============================================
  // BENEFICIOS
  // ============================================

  /**
   * Obtener todos los beneficios (catálogo)
   */
  async getBeneficios(): Promise<Beneficio[]> {
    return this.request<Beneficio[]>('/beneficios/catalogo', {
      method: 'GET',
      requireAuth: true,
    });
  }

  /**
   * Obtener un beneficio por ID
   */
  async getBeneficioById(id: number): Promise<Beneficio> {
    return this.request<Beneficio>(`/beneficios/catalogo/${id}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  /**
   * Crear un nuevo beneficio
   */
  async createBeneficio(data: Omit<Beneficio, 'id'>): Promise<Beneficio> {
    return this.request<Beneficio>('/beneficios/catalogo', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  }

  /**
   * Actualizar un beneficio existente
   */
  async updateBeneficio(id: number, data: Partial<Beneficio>): Promise<Beneficio> {
    return this.request<Beneficio>(`/beneficios/catalogo/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  }

  /**
   * Eliminar un beneficio
   */
  async deleteBeneficio(id: number): Promise<void> {
    return this.request<void>(`/beneficios/catalogo/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }

  // ============================================
  // BENEFICIOS DE ESTUDIANTES
  // ============================================

  /**
   * Obtener todos los beneficios de un estudiante
   */
  async getBeneficiosByEstudiante(estudianteId: string): Promise<BeneficioEstudiante[]> {
    return this.request<BeneficioEstudiante[]>(`/beneficios/estudiante/${estudianteId}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  /**
   * Asignar un beneficio a un estudiante
   */
  async asignarBeneficioEstudiante(
    data: Omit<BeneficioEstudiante, 'id' | 'created_at'>
  ): Promise<BeneficioEstudiante> {
    return this.request<BeneficioEstudiante>('/beneficios/estudiante', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  }

  /**
   * Actualizar un beneficio de estudiante
   */
  async updateBeneficioEstudiante(
    id: number,
    data: Partial<BeneficioEstudiante>
  ): Promise<BeneficioEstudiante> {
    return this.request<BeneficioEstudiante>(`/beneficios/estudiante/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  }

  /**
   * Eliminar un beneficio de estudiante
   */
  async deleteBeneficioEstudiante(id: number): Promise<void> {
    return this.request<void>(`/beneficios/estudiante/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }

  /**
   * Obtener beneficios activos
   */
  async getBeneficiosActivos(): Promise<Beneficio[]> {
    return this.request<Beneficio[]>('/beneficios/catalogo/activos', {
      method: 'GET',
      requireAuth: true,
    });
  }

  /**
   * Obtener beneficios activos de un estudiante
   */
  async getBeneficiosActivosEstudiante(estudianteId: string): Promise<BeneficioEstudiante[]> {
    return this.request<BeneficioEstudiante[]>(
      `/beneficios/estudiante/${estudianteId}?activo=true`,
      {
        method: 'GET',
        requireAuth: true,
      }
    );
  }
}

export const beneficiosService = new BeneficiosService();
