import { BaseHttpClient } from './base.http';
import type { InformacionAdmision, EnsayoPaes } from '../types';

/**
 * Servicio para gestionar información de admisión y ensayos PAES
 */
class InformacionAdmisionService extends BaseHttpClient {
  // ============================================
  // INFORMACIÓN DE ADMISIÓN
  // ============================================

  /**
   * Obtener información de admisión de un estudiante
   */
  async getInformacionAdmision(estudianteId: string): Promise<InformacionAdmision> {
    return this.request<InformacionAdmision>(`/informacion-admision/estudiante/${estudianteId}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  /**
   * Crear información de admisión para un estudiante
   */
  async createInformacionAdmision(
    data: Omit<InformacionAdmision, 'id' | 'created_at' | 'updated_at'>
  ): Promise<InformacionAdmision> {
    return this.request<InformacionAdmision>('/informacion-admision', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  }

  /**
   * Actualizar información de admisión
   */
  async updateInformacionAdmision(
    id: number,
    data: Partial<InformacionAdmision>
  ): Promise<InformacionAdmision> {
    return this.request<InformacionAdmision>(`/informacion-admision/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  }

  /**
   * Eliminar información de admisión
   */
  async deleteInformacionAdmision(id: number): Promise<void> {
    return this.request<void>(`/informacion-admision/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }

  // ============================================
  // ENSAYOS PAES
  // ============================================

  /**
   * Obtener todos los ensayos PAES de un estudiante
   */
  async getEnsayosPaes(estudianteId: string): Promise<EnsayoPaes[]> {
    return this.request<EnsayoPaes[]>(`/informacion-admision/estudiante/${estudianteId}/ensayos`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  /**
   * Obtener un ensayo PAES por ID
   */
  async getEnsayoPaesById(id: number): Promise<EnsayoPaes> {
    return this.request<EnsayoPaes>(`/informacion-admision/ensayos/${id}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  /**
   * Crear un ensayo PAES
   */
  async createEnsayoPaes(
    data: Omit<EnsayoPaes, 'id' | 'created_at'>
  ): Promise<EnsayoPaes> {
    return this.request<EnsayoPaes>('/informacion-admision/ensayos', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  }

  /**
   * Actualizar un ensayo PAES
   */
  async updateEnsayoPaes(
    id: number,
    data: Partial<EnsayoPaes>
  ): Promise<EnsayoPaes> {
    return this.request<EnsayoPaes>(`/informacion-admision/ensayos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  }

  /**
   * Eliminar un ensayo PAES
   */
  async deleteEnsayoPaes(id: number): Promise<void> {
    return this.request<void>(`/informacion-admision/ensayos/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }

  /**
   * Obtener ensayos PAES por año
   */
  async getEnsayosPaesByAño(estudianteId: string, año: number): Promise<EnsayoPaes[]> {
    return this.request<EnsayoPaes[]>(
      `/informacion-admision/estudiante/${estudianteId}/ensayos?año=${año}`,
      {
        method: 'GET',
        requireAuth: true,
      }
    );
  }

  /**
   * Obtener promedio de puntajes PAES de un estudiante
   */
  async getPromedioPuntajes(estudianteId: string): Promise<{
    lenguaje: number;
    matematicas: number;
    ciencias: number;
    historia: number;
  }> {
    return this.request(`/informacion-admision/estudiante/${estudianteId}/promedio-puntajes`, {
      method: 'GET',
      requireAuth: true,
    });
  }
}

export const informacionAdmisionService = new InformacionAdmisionService();
