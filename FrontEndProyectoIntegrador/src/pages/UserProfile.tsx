import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '../services';
import type { Usuario } from '../types';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Grid as GridBase,
  Divider,
  IconButton,
  Card,
  CardContent,
  Chip
} from '@mui/material';
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

export const UserProfile: React.FC<UserProfileProps> = () => {
  const Grid: any = GridBase;
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
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }

    try {
      const profileData = await userService.getCurrentProfile(authService.getCurrentUserOrThrow().rut_usuario);

      // Mapear los campos del backend al formato del frontend
      const mappedProfileData = {
        ...profileData,
        nombres: (profileData as any).nombre || profileData.nombre,
        apellidos: (profileData as any).apellido || profileData.apellido,
        role: (profileData as any).rol || profileData.rol,
      };

      setUser(mappedProfileData);
      setEditedUser({ ...mappedProfileData });
    } catch (error) {
      // Fallback a authService si falla la API
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        // Aplicar mapeo también al fallback
        const mappedCurrentUser = {
          ...currentUser,
          nombres: (currentUser as any).nombre || currentUser.nombre,
          apellidos: (currentUser as any).apellido || currentUser.apellido,
          role: (currentUser as any).rol || currentUser.rol,
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
      // Preparar datos de actualización - solo campos válidos del DTO
      const updateData: any = {};
      
      // Campos que pueden actualizarse según CreateUserDto
      if (editedUser.nombre && editedUser.nombre !== user.nombre) {
        updateData.nombre = editedUser.nombre.trim();
      }
      
      if (editedUser.apellido && editedUser.apellido !== user.apellido) {
        updateData.apellido = editedUser.apellido.trim();
      }
      
      if (editedUser.email && editedUser.email !== user.email) {
        updateData.email = editedUser.email.trim();
      }

      // Solo hacer la petición si hay cambios
      if (Object.keys(updateData).length === 0) {
        setSnackbarMessage('No hay cambios para guardar');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
        setIsEditing(false);
        return;
      }

      const updatedProfile = await userService.updateCurrentProfile(authService.getCurrentUserOrThrow().rut_usuario, updateData);

      // Mapear los campos del backend al formato del frontend
      const mappedProfile = {
        ...updatedProfile,
        nombres: updatedProfile.nombre,
        apellidos: updatedProfile.apellido
      };
      
      // Actualizar el usuario local con los datos mapeados
      setUser(mappedProfile);
      setEditedUser(mappedProfile);
      
      // Actualizar también el localStorage para mantener consistencia
      localStorage.setItem('user', JSON.stringify(mappedProfile));
      
      setIsEditing(false);
      setSnackbarMessage('Perfil actualizado exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido al actualizar perfil';
      setSnackbarMessage(`Error: ${errorMessage}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleInputChange = (field: keyof Usuario, value: string) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [field]: value
      });
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrador',
      'academico': 'Académico',
      'estudiante': 'Estudiante'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    const colorMap: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' } = {
      'admin': 'error',
      'academico': 'primary',
      'estudiante': 'success'
    };
    return colorMap[role] || 'primary';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6">Cargando perfil...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert 
          tipo="error" 
          mensaje="Error al cargar el perfil del usuario"
          onCerrar={() => {}}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#FFFBF0',
      py: 4
    }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
            Mi Perfil
          </Typography>
        </Box>

        {/* Main Profile Card */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Profile Header */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              justifyContent: 'space-between',
              mb: 4 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {/* Avatar sin imagen */}
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: '#e3f2fd',
                    fontSize: '2rem'
                  }}
                >
                  <PersonIcon sx={{ fontSize: '2.5rem', color: '#1976d2' }} />
                </Avatar>

                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {user.nombre && user.apellido 
                      ? `${user.nombre} ${user.apellido}`
                      : user.email?.split('@')[0] ?? 'Usuario'
                    }
                  </Typography>
                  
                  <Chip 
                    label={getRoleDisplayName(user.rol || '')} 
                    color={getRoleColor(user.rol || '')}
                    sx={{ mb: 1 }}
                  />
                  
                  {user.rut_usuario && (
                    <Typography variant="body2" color="textSecondary">
                      RUT: {user.rut_usuario}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Edit Button */}
              <Box>
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{ borderRadius: 2 }}
                  >
                    Editar
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      sx={{ borderRadius: 2 }}
                    >
                      Guardar
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      sx={{ borderRadius: 2 }}
                    >
                      Cancelar
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Personal Information */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 3 
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Información Personal
                </Typography>
                {!isEditing && (
                  <IconButton onClick={handleEdit} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="textSecondary" sx={{ minWidth: 80 }}>
                      Nombres
                    </Typography>
                  </Box>
                  {isEditing ? (
                    <Input
                      etiqueta=""
                      valor={editedUser?.nombre || ''}
                      onChange={(v) => handleInputChange('nombre', v)}
                      placeholder="Nombres"
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 2, ml: 4 }}>
                      {user.nombre || 'No especificado'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="textSecondary" sx={{ minWidth: 80 }}>
                      Apellidos
                    </Typography>
                  </Box>
                  {isEditing ? (
                    <Input
                      etiqueta=""
                      valor={editedUser?.apellido || ''}
                      onChange={(v) => handleInputChange('apellido', v)}
                      placeholder="Apellidos"
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 2, ml: 4 }}>
                      {user.apellido || 'No especificado'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <EmailIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="textSecondary" sx={{ minWidth: 80 }}>
                      Email
                    </Typography>
                  </Box>
                  {isEditing ? (
                    <Input
                      etiqueta=""
                      tipo="email"
                      valor={editedUser?.email || ''}
                      onChange={(v) => handleInputChange('email', v)}
                      placeholder="correo@ejemplo.com"
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 2, ml: 4 }}>
                      {user.email}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <LockIcon sx={{ mr: 1 }} />
              Cambiar Contraseña
            </Typography>

            <Button
              onClick={() => setShowChangePassword(true)}
              variant="outlined"
              color="primary"
              startIcon={<LockIcon />}
            >
              Cambiar Contraseña
            </Button>
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Información de la Cuenta
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BusinessIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="textSecondary">
                    Tipo de Usuario
                  </Typography>
                </Box>
                <Chip 
                  label={getRoleDisplayName(user.rol || '')} 
                  color={getRoleColor(user.rol || '')}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="textSecondary">
                    Fecha de Registro
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {user.created_at 
                    ? new Date(user.created_at).toLocaleDateString('es-CL')
                    : 'No disponible'
                  }
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Snackbar for notifications */}
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
      </Container>
    </Box>
  );
};

export default UserProfile;