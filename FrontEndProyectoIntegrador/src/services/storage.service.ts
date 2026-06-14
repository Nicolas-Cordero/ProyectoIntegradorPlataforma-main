import { BaseHttpClient } from './base.http';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class StorageService extends BaseHttpClient {
  async uploadFotoPerfil(rut_estudiante: string, file: File): Promise<{ foto_url: string }> {
    const formData = new FormData();
    formData.append('foto', file);

    const response = await fetch(`${API_BASE_URL}/estudiante/${rut_estudiante}/foto`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || `HTTP ${response.status}`);
    }

    return response.json() as Promise<{ foto_url: string }>;
  }
}

export const storageService = new StorageService();
