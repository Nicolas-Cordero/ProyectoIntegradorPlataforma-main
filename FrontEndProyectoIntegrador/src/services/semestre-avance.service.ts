import { BaseHttpClient } from './base.http';

export type BackendSemestre = 'PRIMER_SEMESTRE' | 'SEGUNDO_SEMESTRE' | 'INVIERNO' | 'VERANO';
export type TipoSemestre   = 'REGULAR' | 'RECUPERATIVO';

export interface SemestreDto {
  semestre_id: number;
  year: number;
  semestre: BackendSemestre;
  tipo: TipoSemestre;
}

export interface CreateSemestreDto {
  year: number;
  semestre: BackendSemestre;
  tipo: TipoSemestre;
}

class SemestreAvanceService extends BaseHttpClient {
  getAll(): Promise<SemestreDto[]> {
    return this.request<SemestreDto[]>('/semestre');
  }

  create(data: CreateSemestreDto): Promise<SemestreDto> {
    return this.request<SemestreDto>('/semestre', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  remove(semestre_id: number): Promise<void> {
    return this.request<void>(`/semestre/${semestre_id}`, { method: 'DELETE' });
  }

  getByCarrera(codigo_carrera: number): Promise<SemestreDto[]> {
    return this.request<SemestreDto[]>(`/semestre/by-carrera/${codigo_carrera}`);
  }

  linkCarrera(semestre_id: number, codigo_carrera: number): Promise<void> {
    return this.request<void>('/semestre/link-carrera', {
      method: 'POST',
      body: JSON.stringify({ semestre_id, codigo_carrera }),
    });
  }

  unlinkCarrera(semestre_id: number, codigo_carrera: number): Promise<void> {
    return this.request<void>('/semestre/unlink-carrera', {
      method: 'DELETE',
      body: JSON.stringify({ semestre_id, codigo_carrera }),
    });
  }
}

export const semestreAvanceService = new SemestreAvanceService();
