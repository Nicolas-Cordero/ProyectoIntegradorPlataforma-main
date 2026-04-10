import { BaseHttpClient } from './base.http';
import type { Familia } from '../types';

/**
 * Servicio para gestión de información familiar
 */
class FamiliaService extends BaseHttpClient {
  private readonly endpoint = '/familia';

  /**
   * Obtener todas las familias
   */
  async findAll(): Promise<Familia[]> {
    return this.request<Familia[]>(this.endpoint);
  }

  /**
   * Obtener familia por ID
   */
  async findOne(id: string | number): Promise<Familia> {
    return this.request<Familia>(`${this.endpoint}/${id}`);
  }

  /**
   * Obtener familia por ID de estudiante
   */
  async findByEstudiante(estudianteId: string): Promise<Familia> {
    return this.request<Familia>(`${this.endpoint}/estudiante/${estudianteId}`);
  }

  /**
   * Crear nueva familia
   */
  async create(data: Partial<Familia>): Promise<Familia> {
    return this.request<Familia>(this.endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Actualizar familia
   */
  async update(id: string | number, data: Partial<Familia>): Promise<Familia> {
    return this.request<Familia>(`${this.endpoint}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Agregar descripción incremental a madre
   */
  async addDescripcionMadre(id: string | number, descripcion: string): Promise<Familia> {
    return this.request<Familia>(`${this.endpoint}/${id}/descripcion-madre`, {
      method: 'PATCH',
      body: JSON.stringify({ descripcion }),
    });
  }

  /**
   * Agregar descripción incremental a padre
   */
  async addDescripcionPadre(id: string | number, descripcion: string): Promise<Familia> {
    return this.request<Familia>(`${this.endpoint}/${id}/descripcion-padre`, {
      method: 'PATCH',
      body: JSON.stringify({ descripcion }),
    });
  }

  /**
   * Eliminar familia
   */
  async delete(id: string | number): Promise<void> {
    return this.request<void>(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
  }
}

export const familiaService = new FamiliaService();
