type RoleType = 'admin' | 'tutor' | 'invitado' | 'academico' | 'estudiante';
type ColorType = 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'default';

interface RoleConfig {
  label: string;
  color: ColorType;
  iconName: string;
}

const roleConfig: Record<RoleType, RoleConfig> = {
  admin: {
    label: 'Administrador',
    color: 'error',
    iconName: 'AdminPanelSettings',
  },
  tutor: {
    label: 'Tutor',
    color: 'primary',
    iconName: 'SupervisorAccount',
  },
  invitado: {
    label: 'Invitado',
    color: 'info',
    iconName: 'Visibility',
  },
  academico: {
    label: 'Académico',
    color: 'secondary',
    iconName: 'School',
  },
  estudiante: {
    label: 'Estudiante',
    color: 'success',
    iconName: 'Person',
  },
};

/**
 * Obtiene el color asociado a un rol
 */
export function getRoleColor(role: string): ColorType {
  const config = roleConfig[role as RoleType];
  return config?.color || 'default';
}

/**
 * Obtiene el nombre mostrado de un rol
 */
export function getRoleDisplayName(role: string): string {
  const config = roleConfig[role as RoleType];
  return config?.label || role;
}

/**
 * Obtiene el nombre del ícono asociado a un rol
 */
export function getRoleIconName(role: string): string {
  const config = roleConfig[role as RoleType];
  return config?.iconName || 'Person';
}

/**
 * Obtiene toda la configuración de un rol
 */
export function getRoleConfig(role: string): RoleConfig {
  return roleConfig[role as RoleType] || {
    label: role,
    color: 'default',
    iconName: 'Person',
  };
}
