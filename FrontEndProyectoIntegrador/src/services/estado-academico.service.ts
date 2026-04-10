import { BaseHttpClient } from './base.http';

export const StatusEstudiante = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  SUSPENDIDO: 'suspendido',
  ELIMINADO: 'eliminado',
  EGRESADO: 'egresado',
  RETIRADO: 'retirado'
} as const;

export type StatusEstudiante = typeof StatusEstudiante[keyof typeof StatusEstudiante];

export interface EstadoAcademico {
  id: number;
  id_estudiante: string;
  status?: StatusEstudiante;
  status_detalle?: string;
  semestres_suspendidos?: number;
  semestres_totales_carrera?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateEstadoAcademicoDto {
  id_estudiante: string;
  status?: StatusEstudiante;
  status_detalle?: string;
  semestres_suspendidos?: number;
  semestres_totales_carrera?: number;
}

export interface UpdateEstadoAcademicoDto {
  status?: StatusEstudiante;
  status_detalle?: string;
  semestres_suspendidos?: number;
  semestres_totales_carrera?: number;
}

class EstadoAcademicoService extends BaseHttpClient {
  async getAll(): Promise<EstadoAcademico[]> {
    return await this.request<EstadoAcademico[]>('/estado-academico');
  }

  async getById(id: number): Promise<EstadoAcademico> {
    return await this.request<EstadoAcademico>(`/estado-academico/${id}`);
  }

  async getByEstudiante(idEstudiante: string): Promise<EstadoAcademico> {
    return await this.request<EstadoAcademico>(`/estado-academico/estudiante/${idEstudiante}`);
  }

  async create(data: CreateEstadoAcademicoDto): Promise<EstadoAcademico> {
    return await this.request<EstadoAcademico>('/estado-academico', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async update(id: number, data: UpdateEstadoAcademicoDto): Promise<EstadoAcademico> {
    return await this.request<EstadoAcademico>(`/estado-academico/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async upsertByEstudiante(idEstudiante: string, data: UpdateEstadoAcademicoDto): Promise<EstadoAcademico> {
    return await this.request<EstadoAcademico>(`/estado-academico/estudiante/${idEstudiante}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(id: number): Promise<void> {
    return await this.request<void>(`/estado-academico/${id}`, {
      method: 'DELETE'
    });
  }
}

export const estadoAcademicoService = new EstadoAcademicoService();
