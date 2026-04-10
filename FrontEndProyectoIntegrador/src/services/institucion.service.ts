// =====================================
// SERVICIO DE INSTITUCIONES
// =====================================

import { BaseHttpClient } from './base.http';
import type { Institucion } from '../types';

class InstitucionService extends BaseHttpClient {
  
  async getAll(): Promise<Institucion[]> {
    return await this.request<Institucion[]>('/institucion');
  }

  async getById(id: string): Promise<Institucion> {
    return await this.request<Institucion>(`/institucion/${id}`);
  }

  async create(data: Partial<Institucion>): Promise<Institucion> {
    return this.request<Institucion>('/institucion', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<Institucion>): Promise<Institucion> {
    return this.request<Institucion>(`/institucion/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    return this.request<void>(`/institucion/${id}`, {
      method: 'DELETE',
    });
  }
}

export const institucionService = new InstitucionService();
