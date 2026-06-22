import { BaseHttpClient } from './base.http';
import type { Liceo } from '../types';

class LiceoService extends BaseHttpClient {
  async getAll(): Promise<Liceo[]> {
    return this.request<Liceo[]>('/liceo');
  }
}

export const liceoService = new LiceoService();
