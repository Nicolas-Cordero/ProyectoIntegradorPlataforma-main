// ════════════════════════════════════════════════════════════════════════════
// SERVICIO DE AUTENTICACIÓN
// ════════════════════════════════════════════════════════════════════════════

import { type LoginCredentials, type AuthResponse, type Usuario, UserRol, type UserRolType } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class AuthService {
  private currentUser: Usuario | null = null;

  isAuthenticated(): boolean {
    const token = localStorage.getItem('accesstoken');
    const user = localStorage.getItem('user');
    
    return !!(token && user);
  }

  getToken(): string | null {
    return localStorage.getItem('accesstoken');
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Credenciales inválidas');
      }
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const authResponse: AuthResponse = await response.json();
    this.saveAuthData(authResponse);
    
    return authResponse;
  }

  async loginAdmin(credentials: LoginCredentials): Promise<AuthResponse> {
    const result = await this.login(credentials);
    
    if (result.user.rol !== UserRol.ADMIN) {
      throw new Error('Acceso denegado: se requieren permisos de administrador');
    }
    
    return result;
  }



async logout(): Promise<void> {
  const token = this.getToken();
  const refreshToken = localStorage.getItem('refreshtoken');

  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.warn('No se pudo notificar logout al backend:', error);
    }
  }

  this.clearAuthData();
}



  
  getCurrentUser(): Usuario | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      return this.currentUser;
    }

    return null;
  }

  getCurrentUserOrThrow(): Usuario {
    const user = this.getCurrentUser();
    console.log(user);
    if (!user) throw new Error('No hay usuario autenticado');
    return user;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === UserRol.ADMIN;
  }

  async verifyToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.log('🔑 Token expirado, limpiando localStorage');
        this.clearAuthData();
        return false;
      }

      return response.ok;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar código de recuperación');
    }
  }

  async verifyResetCode(email: string, code: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    const result = await response.json();
    return result.valid;
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code, newPassword }),
    });

    if (!response.ok) {
      throw new Error('Error al restablecer contraseña');
    }
  }

  // ================================
  // MÉTODOS PRIVADOS
  // ================================

  private saveAuthData(authResponse: AuthResponse): void {
    const userAny = authResponse.user as any;
    
    // Mapear campos del backend al formato del frontend
    const userToSave: Usuario = {
      rut_usuario: userAny.rut_usuario || '',
      nombre: userAny.nombre || userAny.nombre || '',
      apellido: userAny.apellido || userAny.apellido || '',
      email: authResponse.user.email,
      telefono: userAny.telefono || '',
      rol: (userAny.rol || userAny.rol || UserRol.INVITADO) as UserRolType,
    };
    
    console.log('✅ Usuario guardado en localStorage:', userToSave);
    
    localStorage.setItem('accesstoken', authResponse.accessToken);
    localStorage.setItem('refreshtoken', authResponse.refreshToken);
    localStorage.setItem('user', JSON.stringify(userToSave));
    this.currentUser = userToSave;
  }

  private clearAuthData(): void {
    localStorage.removeItem('accesstoken');
    localStorage.removeItem('refreshtoken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    this.currentUser = null;
  }
}

export const authService = new AuthService();
export default authService;
