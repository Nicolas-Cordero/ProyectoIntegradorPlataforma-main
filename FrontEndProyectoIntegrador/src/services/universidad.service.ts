import { BaseHttpClient } from './base.http';

export interface UniversidadDto {
  codigo_universidad: number;
  nombre: string;
  comuna: string;
}

class UniversidadService extends BaseHttpClient {
  getAll(): Promise<UniversidadDto[]> {
    return this.request<UniversidadDto[]>('/universidad');
  }
}

export const universidadService = new UniversidadService();
