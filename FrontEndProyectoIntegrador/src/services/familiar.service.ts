import { BaseHttpClient } from './base.http';

export const TipoFamiliarEnum = {
  MADRE: 'MADRE',
  PADRE: 'PADRE',
  HERMANO: 'HERMANO',
  ABUELO: 'ABUELO',
  TIO: 'TIO',
  OTRO: 'OTRO'
} as const;

export type TipoFamiliarEnum = typeof TipoFamiliarEnum[keyof typeof TipoFamiliarEnum];

export interface TipoFamiliar {
  id: number;
  tipo: TipoFamiliarEnum;
  descripcion?: string;
  activo: boolean;
}

export interface Familiar {
  id: number;
  id_familia: number;
  tipo_familiar_id: number;
  tipo_familiar?: TipoFamiliar;
  nombres: string;
  apellidos?: string;
  rut?: string;
  telefono?: string;
  fecha_nacimiento?: Date;
  parentesco?: string;
  observaciones?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateFamiliarDto {
  id_familia: number;
  tipo_familiar_id: number;
  nombres: string;
  apellidos?: string;
  rut?: string;
  telefono?: string;
  fecha_nacimiento?: Date;
  parentesco?: string;
  observaciones?: string;
}

export interface UpdateFamiliarDto {
  tipo_familiar_id?: number;
  nombres?: string;
  apellidos?: string;
  rut?: string;
  telefono?: string;
  fecha_nacimiento?: Date;
  parentesco?: string;
  observaciones?: string;
}

class FamiliarService extends BaseHttpClient {
  // CRUD Tipos de Familiar
  async getAllTipos(): Promise<TipoFamiliar[]> {
    return await this.request<TipoFamiliar[]>('/familiar/tipos');
  }

  async getTipoById(id: number): Promise<TipoFamiliar> {
    return await this.request<TipoFamiliar>(`/familiar/tipos/${id}`);
  }

  // CRUD Familiares
  async getAll(): Promise<Familiar[]> {
    return await this.request<Familiar[]>('/familiar');
  }

  async getById(id: number): Promise<Familiar> {
    return await this.request<Familiar>(`/familiar/${id}`);
  }

  async getByFamilia(idFamilia: number): Promise<Familiar[]> {
    return await this.request<Familiar[]>(`/familiar/familia/${idFamilia}`);
  }

  async getByTipo(idFamilia: number, tipoId: number): Promise<Familiar[]> {
    return await this.request<Familiar[]>(`/familiar/familia/${idFamilia}/tipo/${tipoId}`);
  }

  async create(data: CreateFamiliarDto): Promise<Familiar> {
    return await this.request<Familiar>('/familiar', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async update(id: number, data: UpdateFamiliarDto): Promise<Familiar> {
    return await this.request<Familiar>(`/familiar/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(id: number): Promise<void> {
    return await this.request<void>(`/familiar/${id}`, {
      method: 'DELETE'
    });
  }
}

export const familiarService = new FamiliarService();
