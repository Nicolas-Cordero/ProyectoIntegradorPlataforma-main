// =====================================
// SERVICIO DE ESTADÍSTICAS
// =====================================

import { BaseHttpClient } from './base.http';
import type { EstadisticasAdmin } from '../types';

class EstadisticasService extends BaseHttpClient {
  
  async getDashboard(): Promise<EstadisticasAdmin> {
    return await this.request<EstadisticasAdmin>('/estudiante/');
  }
}

export const estadisticasService = new EstadisticasService();
