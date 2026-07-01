import { BaseHttpClient } from './base.http';
import type { EstadoEstudiante } from '../types';

export interface HistorialEstadoCarreraDto {
  id: number;
  codigo_carrera: number;
  estado_anterior: EstadoEstudiante | null;
  estado_nuevo: EstadoEstudiante;
  rut_usuario: string;
  usuario: { nombre: string; apellido: string };
  created_at: string;
}

class HistorialEstadoCarreraService extends BaseHttpClient {
  getByCarrera(codigo_carrera: number): Promise<HistorialEstadoCarreraDto[]> {
    return this.request<HistorialEstadoCarreraDto[]>(
      `/historial-estado-carrera/carrera/${codigo_carrera}`,
    );
  }

  cambiarEstado(data: {
    codigo_carrera: number;
    estado_nuevo: EstadoEstudiante;
  }): Promise<HistorialEstadoCarreraDto> {
    return this.request<HistorialEstadoCarreraDto>('/historial-estado-carrera', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSemestresSupendidos(codigo_carrera: number): Promise<number> {
    const data = await this.request<{ semestres_suspendidos: number }>(
      `/historial-estado-carrera/carrera/${codigo_carrera}/semestres-suspendidos`,
    );
    return data.semestres_suspendidos;
  }
}

export const historialEstadoCarreraService = new HistorialEstadoCarreraService();
