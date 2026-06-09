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
}

export const semestreAvanceService = new SemestreAvanceService();
