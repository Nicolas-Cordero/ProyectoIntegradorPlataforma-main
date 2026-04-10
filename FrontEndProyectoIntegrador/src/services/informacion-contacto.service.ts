import { BaseHttpClient } from './base.http';

export interface InformacionContacto {
  id: number;
  id_estudiante: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateInformacionContactoDto {
  id_estudiante: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface UpdateInformacionContactoDto {
  telefono?: string;
  email?: string;
  direccion?: string;
}

class InformacionContactoService extends BaseHttpClient {
  async getAll(): Promise<InformacionContacto[]> {
    return await this.request<InformacionContacto[]>('/informacion-contacto');
  }

  async getById(id: number): Promise<InformacionContacto> {
    return await this.request<InformacionContacto>(`/informacion-contacto/${id}`);
  }

  async getByEstudiante(idEstudiante: string): Promise<InformacionContacto> {
    return await this.request<InformacionContacto>(`/informacion-contacto/estudiante/${idEstudiante}`);
  }

  async create(data: CreateInformacionContactoDto): Promise<InformacionContacto> {
    return await this.request<InformacionContacto>('/informacion-contacto', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async update(id: number, data: UpdateInformacionContactoDto): Promise<InformacionContacto> {
    return await this.request<InformacionContacto>(`/informacion-contacto/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async upsertByEstudiante(idEstudiante: string, data: UpdateInformacionContactoDto): Promise<InformacionContacto> {
    return await this.request<InformacionContacto>(`/informacion-contacto/estudiante/${idEstudiante}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(id: number): Promise<void> {
    return await this.request<void>(`/informacion-contacto/${id}`, {
      method: 'DELETE'
    });
  }
}

export const informacionContactoService = new InformacionContactoService();
