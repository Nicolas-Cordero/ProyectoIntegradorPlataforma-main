// ════════════════════════════════════════════════════════════════════════════
// SERVICIO DE AUTENTICACIÓN — basado en cookies HTTP-only
// El browser envía la cookie automáticamente; nunca se toca localStorage para tokens.
// ════════════════════════════════════════════════════════════════════════════

import { type LoginCredentials, type Usuario, UserRol, type UserRolType } from '../types';
import { API_BASE_URL } from '../config';

class AuthService {
  private currentUser: Usuario | null = null;

  async login(credentials: LoginCredentials): Promise<{ user: Usuario }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Error del servidor: ${response.status}`);
    }

    const user: Usuario = await response.json();
    this.currentUser = user;
    return { user };
  }

  async loginAdmin(credentials: LoginCredentials): Promise<{ user: Usuario }> {
    const result = await this.login(credentials);
    if (result.user.rol !== UserRol.ADMIN) {
      await this.logout();
      throw new Error('Acceso denegado: se requieren permisos de administrador');
    }
    return result;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.warn('No se pudo notificar logout al backend:', error);
    } finally {
      this.currentUser = null;
    }
  }

  /**
   * Consulta GET /auth/me para obtener el usuario de la sesión activa.
   * Retorna null si no hay sesión válida (401).
   */
  async fetchCurrentUser(): Promise<Usuario | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include',
      });
      if (!response.ok) {
        this.currentUser = null;
        return null;
      }
      const user: Usuario = await response.json();
      this.currentUser = user;
      return user;
    } catch {
      this.currentUser = null;
      return null;
    }
  }

  getCurrentUser(): Usuario | null {
    return this.currentUser;
  }

  getCurrentUserOrThrow(): Usuario {
    if (!this.currentUser) throw new Error('No hay usuario autenticado');
    return this.currentUser;
  }

  isAdmin(): boolean {
    return this.currentUser?.rol === UserRol.ADMIN;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al enviar código de recuperación');
    }
  }

  async verifyResetCode(email: string, code: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, code }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.message || 'Error al verificar el código');
    }
    return result.valid;
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, code, newPassword }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al restablecer contraseña');
    }
  }
}

export const authService = new AuthService();
export default authService;
