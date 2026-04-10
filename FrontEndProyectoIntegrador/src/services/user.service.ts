// =====================================
// SERVICIO DE USUARIOS
// =====================================

import { BaseHttpClient } from './base.http';

class UserService extends BaseHttpClient {
  
  async getAll(): Promise<any[]> {
    return await this.request<any[]>('/users');
  }

  async create(data: any): Promise<any> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: any): Promise<any> {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getCurrentProfile(): Promise<any> {
    return await this.request('/auth/profile');
  }

  async updateCurrentProfile(data: any): Promise<any> {
    // Obtener el usuario actual para conseguir su ID
    const currentUser = await this.getCurrentProfile();
    return this.request(`/users/${currentUser.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changeUserPassword(userId: string, newPassword: string): Promise<any> {
    return this.request(`/users/${userId}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password: newPassword }),
    });
  }

  async changeOwnPassword(currentPassword: string, newPassword: string): Promise<any> {
    return this.request('/users/profile/password', {
      method: 'PATCH',
      body: JSON.stringify({ 
        currentPassword,
        newPassword 
      }),
    });
  }
}

export const userService = new UserService();
