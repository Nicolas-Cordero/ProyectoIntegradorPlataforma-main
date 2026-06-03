import { BaseHttpClient } from './base.http';
import type { Familiar, Parentesco } from '../types';

export interface CreateFamiliarDto {
  rut_estudiante: string;
  rut_familiar: string;
  nombre: string;
  telefono: string;
  parentesco: Parentesco;
  observacion?: string;
}

export interface UpdateFamiliarDto {
  nombre?: string;
  telefono?: string;
  parentesco?: Parentesco;
  observacion?: string;
}

class FamiliarService extends BaseHttpClient {
  async getByEstudiante(rut_estudiante: string): Promise<Familiar[]> {
    return this.request<Familiar[]>(`/familiar/estudiante/${rut_estudiante}`);
  }

  async getById(id: number): Promise<Familiar> {
    return this.request<Familiar>(`/familiar/${id}`);
  }

  async create(data: CreateFamiliarDto): Promise<Familiar> {
    return this.request<Familiar>('/familiar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: number, data: UpdateFamiliarDto): Promise<Familiar> {
    return this.request<Familiar>(`/familiar/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(id: number): Promise<void> {
    return this.request<void>(`/familiar/${id}`, { method: 'DELETE' });
  }
}

export const familiarService = new FamiliarService();
