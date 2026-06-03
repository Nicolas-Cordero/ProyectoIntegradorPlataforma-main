import { BaseHttpClient } from './base.http';
import type { Liceo } from '../types';

class LiceoService extends BaseHttpClient {
  async getAll(): Promise<Liceo[]> {
    return this.request<Liceo[]>('/liceo');
  }

  async getById(rbd: string): Promise<Liceo> {
    return this.request<Liceo>(`/liceo/${rbd}`);
  }
}

export const liceoService = new LiceoService();
