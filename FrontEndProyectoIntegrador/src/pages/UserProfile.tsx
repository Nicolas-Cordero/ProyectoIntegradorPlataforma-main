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
    console.log('🔍 UserProfile - Verificando autenticación...');
    if (!authService.isAuthenticated()) {
      console.log('❌ UserProfile - No autenticado, redirigiendo al login');
      navigate('/');
      return;
    }

    console.log('✅ UserProfile - Usuario autenticado, cargando perfil...');
    try {
      const profileData = await userService.getCurrentProfile();
      console.log('✅ UserProfile - Perfil cargado desde API:', profileData);
      
      // Mapear los campos del backend al formato del frontend
      const mappedProfileData = {
        ...profileData,
        nombres: (profileData as any).nombre || profileData.nombres,
        apellidos: (profileData as any).apellido || profileData.apellidos,
        role: (profileData as any).rol || profileData.role,
      };
      
      setUser(mappedProfileData);
      setEditedUser({ ...mappedProfileData });
    } catch (error) {
      console.error('⚠️ UserProfile - Error al cargar desde API:', error);
      // Fallback a authService si falla la API
      const currentUser = authService.getCurrentUser();
      console.log('🔄 UserProfile - Usando usuario de localStorage:', currentUser);
      if (currentUser) {
        // Aplicar mapeo también al fallback
        const mappedCurrentUser = {
          ...currentUser,
          nombres: (currentUser as any).nombre || currentUser.nombres,
          apellidos: (currentUser as any).apellido || currentUser.apellidos,
          role: (currentUser as any).rol || currentUser.role,
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
      if (editedUser.nombres && editedUser.nombres !== user.nombres) {
        updateData.nombre = editedUser.nombres.trim();
      }
      
      if (editedUser.apellidos && editedUser.apellidos !== user.apellidos) {
        updateData.apellido = editedUser.apellidos.trim();
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

      console.log('📤 Enviando actualización de perfil:', updateData);
      const updatedProfile = await userService.updateCurrentProfile(updateData);
      
      console.log('📥 Respuesta del servidor:', updatedProfile);
      
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
      
      console.log('✅ Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('❌ Error al actualizar perfil:', error);
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
      py: 4
    }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            ← Volver
          </Button>
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
                    {user.nombres && user.apellidos 
                      ? `${user.nombres} ${user.apellidos}`
                      : user.email.split('@')[0]
                    }
                  </Typography>
                  
                  <Chip 
                    label={getRoleDisplayName(user.role || '')} 
                    color={getRoleColor(user.role || '')}
                    sx={{ mb: 1 }}
                  />
                  
                  {user.rut && (
                    <Typography variant="body2" color="textSecondary">
                      RUT: {user.rut}
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
                      valor={editedUser?.nombres || ''}
                      onChange={(v) => handleInputChange('nombres', v)}
                      placeholder="Nombres"
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 2, ml: 4 }}>
                      {user.nombres || 'No especificado'}
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
                      valor={editedUser?.apellidos || ''}
                      onChange={(v) => handleInputChange('apellidos', v)}
                      placeholder="Apellidos"
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 2, ml: 4 }}>
                      {user.apellidos || 'No especificado'}
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
                  label={getRoleDisplayName(user.role || '')} 
                  color={getRoleColor(user.role || '')}
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
                  {user.fecha_creacion 
                    ? new Date(user.fecha_creacion).toLocaleDateString('es-CL')
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