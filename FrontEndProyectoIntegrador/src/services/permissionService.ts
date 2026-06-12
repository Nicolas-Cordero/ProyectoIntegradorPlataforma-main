/**
 * Servicio de gestión de permisos y roles
 * Centraliza la lógica de autorización de la aplicación
 */

import type { Usuario, UserRolType } from '../types';
import { UserRol } from '../types';


/**
 * Servicio de permisos
 * Proporciona métodos para verificar permisos de usuario
 */
export default class PermissionService {
  /**
   * Verifica si un usuario es administrador
   */
  static isAdmin(user: Usuario | null): boolean {
    if (!user) return false;
    return user.rol === UserRol.ADMIN;
  }

  /**
   * Verifica si un usuario es tutor
   */
  static isTutor(user: Usuario | null): boolean {
    if (!user) return false;
    return user.rol === UserRol.TUTOR;
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
    if (interviewCreatorId && user.rut_usuario === interviewCreatorId) return true;
    return false;
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
      { value: UserRol.ADMIN, label: 'Administrador' },
      { value: UserRol.TUTOR, label: 'Tutor' },
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
    return Object.values(UserRol).includes(role as UserRolType);
  }
}

