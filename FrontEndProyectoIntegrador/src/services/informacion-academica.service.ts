import { BaseHttpClient } from './base.http';
import type { InformacionAcademica } from '../types';

class InformacionAcademicaService extends BaseHttpClient {
  async getByEstudiante(idEstudiante: string) {
    return this.request<InformacionAcademica | null>(`/informacion-academica/estudiante/${idEstudiante}`);
  }

  async upsertByEstudiante(idEstudiante: string, data: Partial<InformacionAcademica>) {
    return this.request<InformacionAcademica>(`/informacion-academica/estudiante/${idEstudiante}` , {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const informacionAcademicaService = new InformacionAcademicaService();
