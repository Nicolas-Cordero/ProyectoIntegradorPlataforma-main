import { useState, useEffect } from 'react';
import { authService, PermissionService } from '../../../../services';
import type { SeccionActiva } from '../index';

export const useStudentPermissions = () => {
  const [seccionActiva, setSeccionActiva] = useState<SeccionActiva>('perfil');

  // Obtener usuario actual y permisos
  const currentUser = authService.getCurrentUser();
  const canEdit = PermissionService.canEditStudent(currentUser);
  const canViewInterviews = PermissionService.canViewInterviews(currentUser);
  const isReadOnly = PermissionService.isReadOnly(currentUser);

  // Handler para cambio de sección con validación de permisos
  const handleSeccionChange = (seccion: SeccionActiva) => {
    // Validar acceso a entrevistas
    if (seccion === 'entrevistas' && !canViewInterviews) {
      alert('❌ No tienes permisos para acceder a las entrevistas');
      return;
    }
    
    setSeccionActiva(seccion);
  };

  // Verificar permisos y redirigir si está en sección no permitida
  useEffect(() => {
    if (seccionActiva === 'entrevistas' && !canViewInterviews) {
      setSeccionActiva('perfil');
    }
  }, [seccionActiva, canViewInterviews]);

  return {
    currentUser,
    canEdit,
    canViewInterviews,
    isReadOnly,
    seccionActiva,
    setSeccionActiva,
    handleSeccionChange
  };
};