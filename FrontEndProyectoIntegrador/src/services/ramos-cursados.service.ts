// =====================================
// SERVICIO DE RAMOS CURSADOS
// =====================================

import { BaseHttpClient } from './base.http';

class RamosCursadosService extends BaseHttpClient {
  
  async getAll(): Promise<any[]> {
    return await this.request<any[]>('/ramos-cursados');
  }

  async getById(id: string): Promise<any> {
    return await this.request<any>(`/ramos-cursados/${id}`);
  }

  async getByEstudiante(estudianteId: string, periodoAcademicoEstudianteId?: number): Promise<any[]> {
    let url = `/ramos-cursados/estudiante/${estudianteId}`;
    const params = new URLSearchParams();

    if (periodoAcademicoEstudianteId) {
      params.append('periodo_academico_estudiante_id', periodoAcademicoEstudianteId.toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return await this.request<any[]>(url);
  }

  async create(data: {
    id_estudiante: string;
    periodo_academico_estudiante_id?: number;
    codigo_ramo?: string;
    nombre_ramo?: string;
    nivel_educativo?: string;
    notas_parciales?: any;
    promedio_final?: number | null;
    estado?: string;
    oportunidad?: number;
    comentarios?: string;
  }): Promise<any> {
    return this.request<any>('/ramos-cursados', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<{
    codigo_ramo: string;
    nombre_ramo: string;
    promedio_final: number;
    estado: string;
    oportunidad: number;
    periodo_academico_estudiante_id: number;
  }>): Promise<any> {
    return this.request<any>(`/ramos-cursados/${id}`, {
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
