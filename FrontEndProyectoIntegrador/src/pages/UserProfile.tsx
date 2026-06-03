import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '../services';
import type { Usuario } from '../types';
import { Input, Alert } from '../components/ui';
import { PasswordChangeModal } from '../components/features/auth/password-recovery';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Lock as LockIcon
} from '@mui/icons-material';

interface UserProfileProps {}

const getRoleDisplayName = (role: string) => {
  const map: Record<string, string> = {
    admin:      'Administrador',
    academico:  'Académico',
    estudiante: 'Estudiante',
  };
  return map[role] || role;
};

const getRoleChipClasses = (role: string): string => {
  const map: Record<string, string> = {
    admin:      'bg-red-100 text-red-700',
    academico:  'bg-blue-100 text-blue-700',
    estudiante: 'bg-green-100 text-green-700',
  };
  return map[role] || 'bg-blue-100 text-blue-700';
};

export const UserProfile: React.FC<UserProfileProps> = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Usuario | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await authService.fetchCurrentUser();
      if (!currentUser) {
        navigate('/');
        return;
      }

      try {
        const profileData = await userService.getCurrentProfile(currentUser.rut_usuario);
        const mappedProfileData = {
          ...profileData,
          nombres:  (profileData as any).nombre  || profileData.nombre,
          apellidos: (profileData as any).apellido || profileData.apellido,
          role:     (profileData as any).rol     || profileData.rol,
        };
        setUser(mappedProfileData);
        setEditedUser({ ...mappedProfileData });
      } catch {
        const mappedCurrentUser = {
          ...currentUser,
          nombres:  (currentUser as any).nombre  || currentUser.nombre,
          apellidos: (currentUser as any).apellido || currentUser.apellido,
          role:     (currentUser as any).rol     || currentUser.rol,
        };
        setUser(mappedCurrentUser);
        setEditedUser({ ...mappedCurrentUser });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user! });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({ ...user! });
  };

  const handleSave = async () => {
    if (!editedUser || !user) return;

    try {
      const updateData: any = {};

      if (editedUser.nombre && editedUser.nombre !== user.nombre)
        updateData.nombre = editedUser.nombre.trim();
      if (editedUser.apellido && editedUser.apellido !== user.apellido)
        updateData.apellido = editedUser.apellido.trim();
      if (editedUser.email && editedUser.email !== user.email)
        updateData.email = editedUser.email.trim();

      if (Object.keys(updateData).length === 0) {
        setSnackbarMessage('No hay cambios para guardar');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
        setIsEditing(false);
        return;
      }

      const updatedProfile = await userService.updateCurrentProfile(
        authService.getCurrentUserOrThrow().rut_usuario,
        updateData
      );

      const mappedProfile = {
        ...updatedProfile,
        nombres:  updatedProfile.nombre,
        apellidos: updatedProfile.apellido,
      };

      setUser(mappedProfile);
      setEditedUser(mappedProfile);
      localStorage.setItem('user', JSON.stringify(mappedProfile));
      setIsEditing(false);
      setSnackbarMessage('Perfil actualizado exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      setSnackbarMessage(`Error: ${error.message || 'Error desconocido al actualizar perfil'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleInputChange = (field: keyof Usuario, value: string) => {
    if (editedUser) setEditedUser({ ...editedUser, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert tipo="error" mensaje="Error al cargar el perfil del usuario" onCerrar={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF0] py-8">
      <div className="max-w-[900px] mx-auto px-4">

        {/* Título */}
        <div className="mb-6">
          <h4 className="text-[2.125rem] font-bold text-gray-800">Mi Perfil</h4>
        </div>

        {/* Tarjeta principal */}
        <div className="rounded-xl bg-white shadow-md mb-6">
          <div className="p-8">

            {/* Header de perfil */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <PersonIcon style={{ fontSize: '2.5rem', color: '#1976d2' }} />
                </div>

                <div>
                  <h5 className="text-2xl font-bold mb-1">
                    {user.nombre && user.apellido
                      ? `${user.nombre} ${user.apellido}`
                      : user.email?.split('@')[0] ?? 'Usuario'
                    }
                  </h5>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${getRoleChipClasses(user.rol || '')}`}>
                    {getRoleDisplayName(user.rol || '')}
                  </span>
                  {user.rut_usuario && (
                    <p className="text-sm text-gray-500">RUT: {user.rut_usuario}</p>
                  )}
                </div>
              </div>

              {/* Botones editar/guardar */}
              <div>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors"
                  >
                    <EditIcon style={{ fontSize: 18 }} />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <SaveIcon style={{ fontSize: 18 }} />
                      Guardar
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-400 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <CancelIcon style={{ fontSize: 18 }} />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-t border-gray-200 mb-8" />

            {/* Información personal */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h6 className="text-xl font-bold">Información Personal</h6>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <EditIcon style={{ fontSize: 18 }} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nombres */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <PersonIcon style={{ fontSize: 18, color: 'rgba(0,0,0,0.54)' }} />
                    <span className="text-sm text-gray-500 min-w-[80px]">Nombres</span>
                  </div>
                  {isEditing ? (
                    <Input
                      etiqueta=""
                      valor={editedUser?.nombre || ''}
                      onChange={(v) => handleInputChange('nombre', v)}
                      placeholder="Nombres"
                    />
                  ) : (
                    <p className="text-base ml-7 mb-2">{user.nombre || 'No especificado'}</p>
                  )}
                </div>

                {/* Apellidos */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <PersonIcon style={{ fontSize: 18, color: 'rgba(0,0,0,0.54)' }} />
                    <span className="text-sm text-gray-500 min-w-[80px]">Apellidos</span>
                  </div>
                  {isEditing ? (
                    <Input
                      etiqueta=""
                      valor={editedUser?.apellido || ''}
                      onChange={(v) => handleInputChange('apellido', v)}
                      placeholder="Apellidos"
                    />
                  ) : (
                    <p className="text-base ml-7 mb-2">{user.apellido || 'No especificado'}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <EmailIcon style={{ fontSize: 18, color: 'rgba(0,0,0,0.54)' }} />
                    <span className="text-sm text-gray-500 min-w-[80px]">Email</span>
                  </div>
                  {isEditing ? (
                    <Input
                      etiqueta=""
                      tipo="email"
                      valor={editedUser?.email || ''}
                      onChange={(v) => handleInputChange('email', v)}
                      placeholder="correo@ejemplo.com"
                    />
                  ) : (
                    <p className="text-base ml-7 mb-2">{user.email}</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Tarjeta cambio de contraseña */}
        <div className="rounded-xl bg-white shadow-sm mb-6">
          <div className="p-6">
            <h6 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <LockIcon style={{ fontSize: 22 }} />
              Cambiar Contraseña
            </h6>
            <button
              onClick={() => setShowChangePassword(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              <LockIcon style={{ fontSize: 18 }} />
              Cambiar Contraseña
            </button>
          </div>
        </div>

        {/* Tarjeta información de la cuenta */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="p-6">
            <h6 className="text-xl font-bold mb-6">Información de la Cuenta</h6>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BusinessIcon style={{ fontSize: 18, color: 'rgba(0,0,0,0.54)' }} />
                  <span className="text-sm text-gray-500">Tipo de Usuario</span>
                </div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleChipClasses(user.rol || '')}`}>
                  {getRoleDisplayName(user.rol || '')}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon style={{ fontSize: 18, color: 'rgba(0,0,0,0.54)' }} />
                  <span className="text-sm text-gray-500">Fecha de Registro</span>
                </div>
                <p className="text-sm text-gray-700">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString('es-CL')
                    : 'No disponible'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notificación */}
        {snackbarOpen && (
          <Alert
            tipo={snackbarSeverity === 'error' ? 'error' : 'exito'}
            mensaje={snackbarMessage}
            onCerrar={() => setSnackbarOpen(false)}
          />
        )}

        <PasswordChangeModal
          abierto={showChangePassword}
          userId={user.rut_usuario}
          onCerrar={() => setShowChangePassword(false)}
          onSuccess={() => {
            setSnackbarMessage('Contraseña actualizada exitosamente');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
          }}
        />

      </div>
    </div>
  );
};

export default UserProfile;
