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

// Resumen por estudiante (GET /entrevistas/resumen). Solo trae estudiantes con
// al menos una entrevista; `entrevistas_anio` cuenta desde el 1 de enero (hora de Chile).
export interface ResumenEntrevistasEstudiante {
  rut_estudiante: string;
  ultima_entrevista: string | null;
  entrevistas_anio: number;
}

class EntrevistaService extends BaseHttpClient {

  async getAll(): Promise<Entrevista[]> {
    return await this.request<Entrevista[]>('/entrevistas');
  }

  async getById(id: string): Promise<Entrevista> {
    return await this.request<Entrevista>(`/entrevistas/${id}`);
  }

  async getResumen(generacionId?: number): Promise<ResumenEntrevistasEstudiante[]> {
    const query = generacionId ? `?generacion_id=${generacionId}` : '';
    return await this.request<ResumenEntrevistasEstudiante[]>(`/entrevistas/resumen${query}`);
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
