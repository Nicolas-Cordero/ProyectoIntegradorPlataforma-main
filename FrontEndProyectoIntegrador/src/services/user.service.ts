// =====================================
// SERVICIO DE USUARIOS
// =====================================

import type { Usuario } from '../types';
import { BaseHttpClient } from './base.http';

class UserService extends BaseHttpClient {
  
  async getAll(): Promise<Usuario[]> {
    return await this.request<Usuario[]>('/users');
  }

  async create(data: Partial<Usuario>): Promise<Usuario> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(rut: string, data: Partial<Usuario>): Promise<Usuario> {
    return this.request(`/users/${rut}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(rut: string): Promise<void> {
    return this.request(`/users/${rut}`, {
      method: 'DELETE',
    });
  }

  async getCurrentProfile(rut: string): Promise<Usuario> {
    return await this.request(`/users/${rut}`);
  }

  async updateCurrentProfile(rut: string, data: Partial<Usuario>): Promise<Usuario> {
    return this.request(`/users/${rut}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changeUserPassword(rut: string, newPassword: string): Promise<Usuario> {
    return this.request(`/users/${rut}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password: newPassword }),
    });
  }

  async changeOwnPassword(rut: string, currentPassword: string, newPassword: string): Promise<Usuario> {
    return this.request(`/users/${rut}/password/change`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        currentPassword,
        newPassword 
      }),
    });
  }
}

export const userService = new UserService();
