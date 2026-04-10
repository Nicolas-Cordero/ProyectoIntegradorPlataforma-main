import { BaseHttpClient } from './base.http';

export interface PeriodoAcademico {
  id?: string;
  id_periodo_academico?: string;
  año: number;
  semestre: number;
  es_actual: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface PeriodoAcademicoEstudiante {
  id?: string;
  id_periodo_academico_estudiante?: string;
  estudiante_id: string;
  periodo_academico_id: string;
  periodo_academico?: PeriodoAcademico;
  fecha_inicio?: Date;
  fecha_termino?: Date;
  esta_cursando: boolean;
  observaciones?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreatePeriodoAcademicoDto {
  año: number;
  semestre: number;
  es_actual?: boolean;
}

export interface CreatePeriodoAcademicoEstudianteDto {
  estudiante_id: string;
  periodo_academico_id: string;
  fecha_inicio?: Date;
  fecha_termino?: Date;
  esta_cursando?: boolean;
  observaciones?: string;
}

class PeriodoAcademicoService extends BaseHttpClient {
  // CRUD Periodos Académicos (catálogo)
  async getAllPeriodos(): Promise<PeriodoAcademico[]> {
    return await this.request<PeriodoAcademico[]>('/periodo-academico/periodos');
  }

  async getPeriodoById(id: string): Promise<PeriodoAcademico> {
    return await this.request<PeriodoAcademico>(`/periodo-academico/periodos/${id}`);
  }

  async getPeriodoActual(): Promise<PeriodoAcademico> {
    return await this.request<PeriodoAcademico>('/periodo-academico/periodos/actual');
  }

  async buscarPeriodo(año: number, semestre: number): Promise<PeriodoAcademico> {
    return await this.request<PeriodoAcademico>(`/periodo-academico/periodos/buscar?año=${año}&semestre=${semestre}`);
  }

  async createPeriodo(data: CreatePeriodoAcademicoDto): Promise<PeriodoAcademico> {
    return await this.request<PeriodoAcademico>('/periodo-academico/periodos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // CRUD Periodos por Estudiante
  async getAll(): Promise<PeriodoAcademicoEstudiante[]> {
    return await this.request<PeriodoAcademicoEstudiante[]>('/periodo-academico');
  }

  async getById(id: string): Promise<PeriodoAcademicoEstudiante> {
    return await this.request<PeriodoAcademicoEstudiante>(`/periodo-academico/${id}`);
  }

  async getByEstudiante(idEstudiante: string): Promise<PeriodoAcademicoEstudiante[]> {
    return await this.request<PeriodoAcademicoEstudiante[]>(`/periodo-academico/estudiante/${idEstudiante}`);
  }

  async getByPeriodo(periodoId: string): Promise<PeriodoAcademicoEstudiante[]> {
    return await this.request<PeriodoAcademicoEstudiante[]>(`/periodo-academico/periodo/${periodoId}`);
  }

  async create(data: CreatePeriodoAcademicoEstudianteDto): Promise<PeriodoAcademicoEstudiante> {
    return await this.request<PeriodoAcademicoEstudiante>('/periodo-academico', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async update(id: string, data: Partial<CreatePeriodoAcademicoEstudianteDto>): Promise<PeriodoAcademicoEstudiante> {
    return await this.request<PeriodoAcademicoEstudiante>(`/periodo-academico/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(id: string): Promise<void> {
    return await this.request<void>(`/periodo-academico/${id}`, {
      method: 'DELETE'
    });
  }
}

export const periodoAcademicoService = new PeriodoAcademicoService();
