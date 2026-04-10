/**
 * Servicio de gestión de permisos y roles
 * Centraliza la lógica de autorización de la aplicación
 */

import type { Usuario } from '../types';

/**
 * Roles disponibles en el sistema
 */
export const UserRole = {
  ADMIN: 'admin',
  TUTOR: 'tutor',
  INVITADO: 'invitado'
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/**
 * Servicio de permisos
 * Proporciona métodos para verificar permisos de usuario
 */
export default class PermissionService {
  /**
   * Verifica si un usuario es administrador
   */
  static isAdmin(user: Usuario | null): boolean {
    if (!user) {
      console.log('🔴 isAdmin: usuario es null');
      return false;
    }
    console.log('🔍 isAdmin - Role:', user.role);
    return user.role === 'admin';
  }

  /**
   * Verifica si un usuario es tutor
   */
  static isTutor(user: Usuario | null): boolean {
    if (!user) return false;
    return user.role === 'tutor';
  }

  /**
   * Verifica si un usuario es invitado
   */
  static isInvitado(user: Usuario | null): boolean {
    if (!user) return false;
    return user.role === 'invitado';
  }

  /**
   * Verifica si un usuario puede gestionar otros usuarios
   * Solo los administradores pueden gestionar usuarios
   */
  static canManageUsers(user: Usuario | null): boolean {
    return this.isAdmin(user);
  }

  /**
   * Verifica si un usuario puede crear estudiantes
   * Administradores y tutores pueden crear estudiantes
   */
  static canCreateStudent(user: Usuario | null): boolean {
    return this.isAdmin(user) || this.isTutor(user);
  }

  /**
   * Verifica si un usuario puede editar estudiantes
   * Solo administradores y tutores pueden editar estudiantes
   */
  static canEditStudent(user: Usuario | null): boolean {
    return this.isAdmin(user) || this.isTutor(user);
  }

  /**
   * Verifica si un usuario puede eliminar estudiantes
   * Solo administradores pueden eliminar estudiantes
   */
  static canDeleteStudent(user: Usuario | null): boolean {
    return this.isAdmin(user);
  }


  /**
   * Verifica si un usuario puede ver entrevistas
   * Administradores y tutores pueden ver entrevistas
   */
  static canViewInterviews(user: Usuario | null): boolean {
    return this.isAdmin(user) || this.isTutor(user);
  }

  /**
   * Verifica si un usuario puede crear entrevistas
   * Administradores y tutores pueden crear entrevistas
   */
  static canCreateInterview(user: Usuario | null): boolean {
    return this.isAdmin(user) || this.isTutor(user);
  }

  /**
   * Verifica si un usuario puede editar entrevistas
   * Solo el creador o administradores pueden editar
   */
  static canEditInterview(user: Usuario | null, interviewCreatorId?: string): boolean {
    if (!user) return false;
    if (this.isAdmin(user)) return true;
    if (interviewCreatorId && user.id === interviewCreatorId) return true;
    return false;
  }

  /**
   * Verifica si un usuario puede acceder al dashboard
   * Todos los usuarios autenticados pueden acceder
   */
  static canAccessDashboard(user: Usuario | null): boolean {
    return user !== null;
  }

  /**
   * Verifica si un usuario puede ver reportes
   * Administradores y tutores pueden ver reportes
   */
  static canViewReports(user: Usuario | null): boolean {
    return this.isAdmin(user) || this.isTutor(user);
  }

  /**
   * Verifica si un usuario puede exportar datos
   * Solo administradores pueden exportar datos
   */
  static canExportData(user: Usuario | null): boolean {
    return this.isAdmin(user);
  }

  /**
   * Obtiene el nombre del rol para mostrar
   */
  static getRoleDisplayName(role: string): string {
    const roleNames: Record<string, string> = {
      'admin': 'Administrador',
      'tutor': 'Tutor',
      'invitado': 'Invitado'
    };
    return roleNames[role] || role;
  }

  /**
   * Obtiene el color asociado a un rol (para UI)
   */
  static getRoleColor(role: string): string {
    const roleColors: Record<string, string> = {
      'admin': '#D84315', // Coral dark
      'tutor': '#4DB6AC', // Turquoise
      'invitado': '#FFB74D' // Orange
    };
    return roleColors[role] || '#9E9E9E';
  }

  /**
   * Obtiene todos los roles disponibles
   */
  static getAllRoles(): Array<{ value: string; label: string }> {
    return [
      { value: UserRole.ADMIN, label: 'Administrador' },
      { value: UserRole.TUTOR, label: 'Tutor' },
      { value: UserRole.INVITADO, label: 'Invitado' }
    ];
  }

  /**
   * Verifica si un usuario puede ver datos del estudiante
   * Administradores y tutores pueden ver datos
   */
  static canViewStudent(user: Usuario | null): boolean {
    return this.isAdmin(user) || this.isTutor(user);
  }

  /**
   * Verifica si un usuario tiene acceso de solo lectura
   * Los tutores tienen acceso de solo lectura
   */
  static isReadOnly(user: Usuario | null): boolean {
    return this.isTutor(user);
  }

  /**
   * Valida si un rol es válido
   */
  static isValidRole(role: string): boolean {
    return Object.values(UserRole).includes(role as UserRole);
  }
}

// Exportar también el enum para uso directo
export { UserRole as Role };
