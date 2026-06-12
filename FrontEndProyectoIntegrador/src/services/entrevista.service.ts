// =====================================
// SERVICIO DE ENTREVISTAS
// =====================================

import { BaseHttpClient } from './base.http';
import type { Entrevista } from '../types';

export interface TextoEntrevista {
  id?: number | string;
  nombre_etiqueta?: string;
  contenido?: string;
  contexto?: string;
  fecha?: string;
  etiqueta?: { nombre_etiqueta?: string };
}

class EntrevistaService extends BaseHttpClient {

  /**
   * Obtiene todos los textos (comentarios/notas) de todas las entrevistas de un estudiante
   */
  async getAllTextosByEstudiante(estudianteId: string): Promise<TextoEntrevista[]> {
    const entrevistas = await this.getByEstudiante(estudianteId);
    if (!entrevistas || entrevistas.length === 0) return [];
    const textosArrays = await Promise.all(
      entrevistas.map(e => this.getTextos(e.id))
    );
    return textosArrays.flat();
  }
  
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

  async update(id: string, data: Partial<Entrevista>): Promise<Entrevista> {
    return this.request<Entrevista>(`/entrevistas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    return this.request<void>(`/entrevistas/${id}`, {
      method: 'DELETE',
    });
  }

  async getTextos(entrevistaId: number): Promise<TextoEntrevista[]> {
    return await this.request<TextoEntrevista[]>(`/entrevistas/${entrevistaId}/textos`);
  }

  async addTexto(entrevistaId: string, textoData: {
    nombre_etiqueta: string;
    contenido: string;
    contexto?: string;
    fecha?: string;
  }): Promise<TextoEntrevista> {
    return this.request<TextoEntrevista>(`/entrevistas/${entrevistaId}/textos`, {
      method: 'POST',
      body: JSON.stringify(textoData),
    });
  }

  async updateTexto(entrevistaId: string, textoId: string, data: Partial<TextoEntrevista>): Promise<TextoEntrevista> {
    return this.request<TextoEntrevista>(`/entrevistas/${entrevistaId}/textos/${textoId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTexto(entrevistaId: string, textoId: string): Promise<void> {
    return this.request<void>(`/entrevistas/${entrevistaId}/textos/${textoId}`, {
      method: 'DELETE',
    });
  }
  
}

export const entrevistaService = new EntrevistaService();
