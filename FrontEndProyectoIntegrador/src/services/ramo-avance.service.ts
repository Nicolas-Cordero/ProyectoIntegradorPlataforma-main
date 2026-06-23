import { BaseHttpClient } from './base.http';
import type { BackendSemestre, TipoSemestre } from './semestre-avance.service';

export type EstadoRamoAvance = 'APROBADO' | 'REPROBADO' | 'CURSANDO' | 'ELIMINADO';

export interface RamoAvanceDto {
  id: number;
  semestre_id: number;
  rut_estudiante: string;
  codigo_carrera: number;
  nombre: string;
  estado: EstadoRamoAvance;
  comentario: string;
  intento: number;
  // Decimal de Prisma: el backend puede serializarlo como string
  nota_final: number | string | null;
  url_certificado: string | null;
  semestre: {
    semestre_id: number;
    year: number;
    semestre: BackendSemestre;
    tipo: TipoSemestre;
  };
}

export interface CreateRamoAvanceDto {
  semestre_id: number;
  rut_estudiante: string;
  codigo_carrera: number;
  nombre: string;
  estado: EstadoRamoAvance;
  comentario?: string;
  intento?: number;
  nota_final?: number | null;
}

export interface UpdateRamoAvanceDto {
  nombre?: string;
  estado?: EstadoRamoAvance;
  comentario?: string;
  intento?: number;
  nota_final?: number | null;
}

class RamoAvanceService extends BaseHttpClient {
  getByCarrera(codigo_carrera: number): Promise<RamoAvanceDto[]> {
    return this.request<RamoAvanceDto[]>(`/ramo/carrera/${codigo_carrera}`);
  }

  create(data: CreateRamoAvanceDto): Promise<RamoAvanceDto> {
    return this.request<RamoAvanceDto>('/ramo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  update(id: number, data: UpdateRamoAvanceDto): Promise<RamoAvanceDto> {
    return this.request<RamoAvanceDto>(`/ramo/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  remove(id: number): Promise<void> {
    return this.request<void>(`/ramo/${id}`, { method: 'DELETE' });
  }
}

export const ramoAvanceService = new RamoAvanceService();
