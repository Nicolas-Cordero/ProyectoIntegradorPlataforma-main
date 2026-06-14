import { BaseHttpClient } from './base.http';
import type { Paes } from '../types';

export interface CreatePaesDto {
  rut_estudiante: string;
  matematicas: number;
  lenguaje: number;
  nem: number;
  ranking: number;
  matematicas2?: number;
  ciencias?: number;
  historia?: number;
}

export interface UpdatePaesDto {
  matematicas?: number;
  lenguaje?: number;
  nem?: number;
  ranking?: number;
  matematicas2?: number;
  ciencias?: number;
  historia?: number;
}

class PaesService extends BaseHttpClient {
  async getPaesByEstudiante(rut: string): Promise<Paes> {
    return this.request<Paes>(`/paes/estudiante/${rut}`);
  }

  async createPaes(data: CreatePaesDto): Promise<Paes> {
    return this.request<Paes>('/paes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaes(rut: string, data: UpdatePaesDto): Promise<Paes> {
    return this.request<Paes>(`/paes/${rut}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const paesService = new PaesService();
