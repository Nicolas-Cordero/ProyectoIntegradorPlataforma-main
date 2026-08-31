// =====================================
// SERVICIO DE ENTREVISTAS
// =====================================

import { BaseHttpClient } from './base.http';
import type { Entrevista } from '../types';

export interface CreateEntrevistaPayload {
  rut_estudiante: string;
  fecha_hora?: string;
  duracion_s: number;
  resumen?: string;
  // Anotación general de la entrevista: una sola, opcional.
  comentario?: string;
}

class EntrevistaService extends BaseHttpClient {

  async getAll(): Promise<Entrevista[]> {
    return await this.request<Entrevista[]>('/entrevistas');
  }

  async getById(id: string): Promise<Entrevista> {
    return await this.request<Entrevista>(`/entrevistas/${id}`);
  }

  async getByEstudiante(estudianteId: string): Promise<Entrevista[]> {
    return await this.request<Entrevista[]>(`/entrevistas/estudiante/${estudianteId}`);
  }

  async create(data: Partial<Entrevista>): Promise<Entrevista> {
    return this.request<Entrevista>('/entrevistas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async crearEntrevista(payload: CreateEntrevistaPayload): Promise<Entrevista> {
    return this.request<Entrevista>('/entrevistas', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async actualizarEntrevista(id: number, data: {
    fecha_hora?: string;
    duracion_s?: number;
    resumen?: string;
  }): Promise<Entrevista> {
    return this.request<Entrevista>(`/entrevistas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async eliminarEntrevista(id: number): Promise<void> {
    return this.request<void>(`/entrevistas/${id}`, { method: 'DELETE' });
  }
}

export const entrevistaService = new EntrevistaService();
