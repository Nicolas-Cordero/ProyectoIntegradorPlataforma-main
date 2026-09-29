import { BaseHttpClient } from './base.http';
import type { Comuna } from '../types';

class ComunaService extends BaseHttpClient {
  getAll(): Promise<Comuna[]> {
    return this.request<Comuna[]>('/comuna');
  }
}

export const comunaService = new ComunaService();
