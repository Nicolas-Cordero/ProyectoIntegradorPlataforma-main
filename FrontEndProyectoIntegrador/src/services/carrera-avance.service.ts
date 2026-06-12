import { BaseHttpClient } from './base.http';

export type ViaAcceso = 'ESPECIAL' | 'REGULAR' | 'PACE';

export interface CarreraAvanceDto {
  codigo_carrera: number;
  nombre: string;
  rut_estudiante: string;
  duracion_sem: number;
  codigo_universidad: number;
  via_acceso: ViaAcceso;
}

export interface CreateCarreraAvanceDto {
  nombre: string;
  rut_estudiante: string;
  duracion_sem: number;
  codigo_universidad: number;
  via_acceso: ViaAcceso;
}

class CarreraAvanceService extends BaseHttpClient {
  getByEstudiante(rut_estudiante: string): Promise<CarreraAvanceDto[]> {
    return this.request<CarreraAvanceDto[]>(`/carrera/estudiante/${rut_estudiante}`);
  }

  create(data: CreateCarreraAvanceDto): Promise<CarreraAvanceDto> {
    return this.request<CarreraAvanceDto>('/carrera', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  remove(codigo_carrera: number): Promise<void> {
    return this.request<void>(`/carrera/${codigo_carrera}`, { method: 'DELETE' });
  }
}

export const carreraAvanceService = new CarreraAvanceService();
