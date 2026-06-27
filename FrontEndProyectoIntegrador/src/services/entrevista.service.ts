// =====================================
// SERVICIO DE ENTREVISTAS
// =====================================

import { BaseHttpClient } from './base.http';
import type { Entrevista, Topico } from '../types';

export interface CreateEntrevistaPayload {
  rut_estudiante: string;
  fecha_hora?: string;
  duracion_s: number;
  resumen?: string;
  comentarios?: { topico: Topico; texto: string }[];
}

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
  async getTextos(entrevistaId: string | number): Promise<TextoEntrevista[]> {
    const entrevista = await this.getById(String(entrevistaId));
    return (entrevista.comentarios ?? []).map(c => ({
      id: c.id,
      nombre_etiqueta: c.topico,
      contenido: c.texto,
      fecha: c.created_at as string,
    }));
  }

  async addTexto(entrevistaId: string | number, data: Omit<TextoEntrevista, 'id'>): Promise<TextoEntrevista> {
    return this.request<TextoEntrevista>('/comentario', {
      method: 'POST',
      body: JSON.stringify({
        entrevista_id: Number(entrevistaId),
        topico: data.nombre_etiqueta,
        texto: data.contenido,
      }),
    });
  }

  async updateTexto(_entrevistaId: string | number, textId: string | number, data: Partial<TextoEntrevista>): Promise<TextoEntrevista> {
    return this.request<TextoEntrevista>(`/comentario/${textId}`, {
      method: 'PATCH',
      body: JSON.stringify({ texto: data.contenido }),
    });
  }

  async deleteTexto(_entrevistaId: string | number, textId: string | number): Promise<void> {
    return this.request<void>(`/comentario/${textId}`, { method: 'DELETE' });
  }

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
