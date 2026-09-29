import { BaseHttpClient } from './base.http';
import type { Universidad } from '../types';

export type UniversidadDto = Universidad;

export interface CreateUniversidadDto {
  nombre: string;
  codigo_comuna: number;
}

class UniversidadService extends BaseHttpClient {
  getAll(): Promise<UniversidadDto[]> {
    return this.request<UniversidadDto[]>('/universidad');
  }

  // El backend rechaza (409) una institución que ya existe en esa comuna,
  // aunque el nombre venga escrito con otras mayúsculas, tildes o signos.
  create(data: CreateUniversidadDto): Promise<UniversidadDto> {
    return this.request<UniversidadDto>('/universidad', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const universidadService = new UniversidadService();
