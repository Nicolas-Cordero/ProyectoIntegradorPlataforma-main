import { BaseHttpClient } from './base.http';
import type { ComentarioEntrevista } from '../types';

class ComentarioService extends BaseHttpClient {
  async actualizar(id: number, texto: string): Promise<ComentarioEntrevista> {
    return this.request<ComentarioEntrevista>(`/comentario/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ texto }),
    });
  }

  async eliminar(id: number): Promise<void> {
    return this.request<void>(`/comentario/${id}`, { method: 'DELETE' });
  }
}

export const comentarioService = new ComentarioService();
