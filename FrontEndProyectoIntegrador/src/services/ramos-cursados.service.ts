// =====================================
// SERVICIO DE RAMOS CURSADOS
// =====================================

import { BaseHttpClient } from './base.http';

export interface RamoCursado {
  id?: number | string;
  id_estudiante: string;
  periodo_academico_estudiante_id?: number;
  codigo_ramo?: string;
  nombre_ramo?: string;
  nivel_educativo?: string;
  notas_parciales?: Record<string, unknown>;
  promedio_final?: number | null;
  estado?: string;
  oportunidad?: number;
  comentarios?: string;
}

class RamosCursadosService extends BaseHttpClient {

  async getAll(): Promise<RamoCursado[]> {
    return await this.request<RamoCursado[]>('/ramos-cursados');
  }

  async getById(id: string): Promise<RamoCursado> {
    return await this.request<RamoCursado>(`/ramos-cursados/${id}`);
  }

  async getByEstudiante(estudianteId: string, periodoAcademicoEstudianteId?: number): Promise<RamoCursado[]> {
    let url = `/ramos-cursados/estudiante/${estudianteId}`;
    const params = new URLSearchParams();

    if (periodoAcademicoEstudianteId) {
      params.append('periodo_academico_estudiante_id', periodoAcademicoEstudianteId.toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return await this.request<RamoCursado[]>(url);
  }

  async create(data: Omit<RamoCursado, 'id'>): Promise<RamoCursado> {
    return this.request<RamoCursado>('/ramos-cursados', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<Omit<RamoCursado, 'id' | 'id_estudiante'>>): Promise<RamoCursado> {
    return this.request<RamoCursado>(`/ramos-cursados/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    return this.request<void>(`/ramos-cursados/${id}`, {
      method: 'DELETE',
    });
  }
}

export const ramosCursadosService = new RamosCursadosService();
