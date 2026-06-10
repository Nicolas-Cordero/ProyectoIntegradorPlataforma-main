import { BaseHttpClient } from './base.http';

export interface Alerta {
  rut_estudiante?: string;
  tipo: string;
  message: string;
  created_at: string;
}

class AlertasService extends BaseHttpClient {
  async getAlertas(): Promise<Alerta[]> {
    return this.request<Alerta[]>('/alertas');
  }

  async getAlertasByEstudiante(rut: string): Promise<Alerta[]> {
    return this.request<Alerta[]>(`/alertas/estudiante/${rut}`);
  }

  async getAlertasByGeneracion(generacion: string): Promise<Alerta[]> {
    return this.request<Alerta[]>(`/alertas/generacion/${generacion}`);
  }
}

export const alertasService = new AlertasService();
