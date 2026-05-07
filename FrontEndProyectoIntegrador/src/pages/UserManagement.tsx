import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService, PermissionService } from '../services';
import type { Usuario } from '../types';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Avatar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Modal, Input, Select, Button, Alert } from '../components/ui';
import { PasswordChangeModal } from '../components/features/auth/password-recovery';
import {
  Add as AddIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SupervisorAccount as TutorIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  SpaceBar as DashboardIcon
} from '@mui/icons-material';
import { GradientButton } from '../components/common/GradientButton';
import { TypingText } from '../components/common/TypingText';
import { useConfirmDialog } from '../components/ui';
import { DashboardParticles } from '../components/features/dashboard/DashboardParticles';
import marcoIzquierdo from '../assets/frames/marco-izquierda.svg';
import marcoDerecho from '../assets/frames/mardo-derecha.svg';
import userSvg from '../assets/icons/user.svg';

export const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const showAdminChip = useMediaQuery(theme.breakpoints.up('lg'));
  
  const [users, setUsers] = useState<Usuario[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Usuario[]>([]);
  const [tabValue, setTabValue] = useState<'todos' | 'tutores' | 'visitas'>('todos');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordChangeUser, setPasswordChangeUser] = useState<Usuario | null>(null);
  const [usuario, setUsuario] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    rut: '',
    telefono: '',
    rol: 'tutor' as 'tutor' | 'visita'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [tabValue, users]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const loadData = async () => {
    if (!authService.isAuthenticated()) {
      console.log('No autenticado, redirigiendo al login');
      navigate('/');
      return;
    }

    // Verificar que el token sea válido
    const tokenValid = await authService.verifyToken();
    if (!tokenValid) {
      navigate('/');
      return;
    }

    const user = authService.getCurrentUser();
    setUsuario(user);
    
    // Dar tiempo para que el usuario vea el mensaje
    if (!PermissionService.canManageUsers(user)) {
      console.error('🚫 Usuario sin permisos de administrador');
      setSnackbar({ 
        open: true, 
        message: 'No tienes permisos para acceder a esta sección. Debes ser administrador.', 
        severity: 'error' 
      });
      // Aumentar el tiempo para que el usuario pueda ver el error
      setTimeout(() => {
        console.log('⏰ Redirigiendo al dashboard por falta de permisos...');
        navigate('/dashboard');
      }, 3000);
      return;
    }

    await loadUsers();
  };

  const loadUsers = async () => {
    try {
      const usersData = await userService.getAll();
      const mappedUsers = (usersData as any[]).map((user) => ({
        ...user,
        role: user.rol || user.role || 'visita',
        nombres: user.nombre || user.nombres || '',
        apellidos: user.apellido || user.apellidos || '',
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setSnackbar({ open: true, message: 'Error al cargar usuarios', severity: 'error' });
    }
  };

  const filterUsers = () => {
    if (tabValue === 'todos') {
      setFilteredUsers(users);
    } else if (tabValue === 'tutores') {
      setFilteredUsers(users.filter(u => u.role === 'tutor'));
    } else {
      setFilteredUsers(users.filter(u => u.role === 'visita' || u.role === 'invitado'));
    }
  };

  const handleOpenDialog = (user?: Usuario) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        email: user.email,
        password: '',
        rut: user.rut || '',
        telefono: user.telefono || '',
        rol: (user as any).rol || user.role as 'tutor' | 'visita'
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombres: '',
        apellidos: '',
        email: '',
        password: '',
        rut: '',
        telefono: '',
        rol: 'tutor'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      nombres: '',
      apellidos: '',
      email: '',
      password: '',
      rut: '',
      telefono: '',
      rol: 'tutor'
    });
  };

  const handleSaveUser = async () => {
    // Validaciones
    if (!formData.nombres || !formData.apellidos || !formData.email) {
      setSnackbar({ open: true, message: 'Por favor completa los campos obligatorios', severity: 'error' });
      return;
    }

    if (!editingUser && !formData.password) {
      setSnackbar({ open: true, message: 'La contraseña es obligatoria para nuevos usuarios', severity: 'error' });
      return;
    }

    try {
      // Mapear datos del frontend al formato del backend
      const userData = {
        username: formData.email, // Usar email como username
        nombre: formData.nombres,
        apellido: formData.apellidos,
        email: formData.email,
        password: formData.password,
        rol: formData.rol, // El backend espera 'tutor' o 'visita' en minúsculas
        activo: true
      };

      console.log('📤 Enviando datos de usuario:', userData);

      if (editingUser) {
        // Actualizar usuario existente
        const updateData = { ...userData };
        if (!updateData.password) {
          delete (updateData as any).password; // No enviar password vacío en actualizaciones
        }
        await userService.update(editingUser.id!, updateData);
        setSnackbar({ open: true, message: 'Usuario actualizado exitosamente', severity: 'success' });
      } else {
        // Crear nuevo usuario
        await userService.create(userData);
        setSnackbar({ open: true, message: `${formData.rol === 'tutor' ? 'Tutor' : 'Visitante'} creado exitosamente`, severity: 'success' });
      }
      
      handleCloseDialog();
      await loadUsers(); // Recargar lista
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar el usuario';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    showConfirm({
      title: 'Eliminar usuario',
      message: '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      confirmColor: 'error',
      onConfirm: async () => {
        await userService.delete(userId);
        setSnackbar({ open: true, message: 'Usuario eliminado exitosamente', severity: 'success' });
        await loadUsers(); // Recargar lista
      }
    });
  };

  const getRoleColor = (role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
    const colorMap: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' } = {
      'admin': 'error',
      'tutor': 'primary',
      'visita': 'info'
    };
    return colorMap[role] || 'secondary';
  };

  return (
    <Box className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Contenido Principal */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-6 lg:px-8 py-8 w-full">
        {/* Título */}
        <div className="mb-8">
          <TypingText
            component="h2"
            text="Gestión de Usuarios"
            startDelayMs={0}
            charDelayMs={1}
            sx={{
              display: 'block',
              fontSize: '1.875rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
              color: '#1f2937',
            }}
          />
          <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500 }}>
            Administra tutores y visitantes de la plataforma
          </Typography>
        </div>

        <Paper
        sx={{
          mb: 6,
          borderRadius: 2,
          background: `
            linear-gradient(135deg, rgba(238, 179, 93, 0.15) 0%, rgba(238, 179, 93, 0.08) 100%),
            rgba(255, 255, 255, 0.85)
          `,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(238, 179, 93, 0.3)',
          boxShadow: '0 8px 32px rgba(238, 179, 93, 0.12)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2
          }}
        >
          {/* Tabs izquierda */}
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              flex: 1,

              borderBottom: '2px solid',
              borderColor: 'rgba(238, 179, 93, 0.2)',

              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                color: 'rgba(31, 41, 55, 0.6)',

                '&.Mui-selected': {
                  color: '#EEB35D',
                  fontWeight: 700
                },

                '&:hover': {
                  backgroundColor: 'rgba(238, 179, 93, 0.08)',
                  color: 'rgba(238, 179, 93, 0.9)'
                }
              },

              '& .MuiTabs-indicator': {
                background:
                  'linear-gradient(135deg, #f9b150 0%, #EEB35D 100%)',
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab label={`Todos (${users.length})`} value="todos" />

            <Tab
              label={`Tutores (${users.filter(u => u.role === 'tutor').length})`}
              value="tutores"
              icon={<TutorIcon />}
              iconPosition="start"
            />

            <Tab
              label={`Visitas (${users.filter(u => u.role === 'visita' || u.role === 'invitado').length})`}
              value="visitas"
              icon={<VisibilityIcon />}
              iconPosition="start"
            />
          </Tabs>

          {/* Botón derecha */}
          <Box sx={{ ml: 2, flexShrink: 0 }}>
            <GradientButton
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              solidColor={'#65B39B'}
              sx={{ minHeight: { xs: 48, md: 56 } }}
            >
              Agregar Estudiante
            </GradientButton>
          </Box>
        </Box>
      </Paper>

        {/* Botón Agregar Usuario */}
        

        {/* Table */}
        <TableContainer component={Paper} sx={{ 
          borderRadius: 2, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(101, 179, 155, 0.08)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#1f2937' }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1f2937' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1f2937' }}>RUT</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1f2937' }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1f2937' }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1f2937' }}>Estado</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#1f2937' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Box
                        component="img"
                        src={userSvg}
                        alt="Sin usuarios"
                        sx={{
                          width: 64,
                          height: 64,
                          opacity: 0.3,
                          mb: 1
                        }}
                      />
                      <Typography color="textSecondary" sx={{ fontWeight: 500 }}>
                        No hay usuarios registrados
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(101, 179, 155, 0.04)' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(101, 179, 155, 0.2)' }}>
                          <Box
                            component="img"
                            src={userSvg}
                            alt="Usuario"
                            sx={{
                              width: 24,
                              height: 24,
                              objectFit: 'contain'
                            }}
                          />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                            {user.nombres} {user.apellidos}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {user.fecha_creacion && `Desde ${new Date(user.fecha_creacion).toLocaleDateString('es-CL')}`}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#6b7280' }}>{user.email}</TableCell>
                    <TableCell sx={{ color: '#6b7280' }}>{user.rut || '-'}</TableCell>
                    <TableCell sx={{ color: '#6b7280' }}>{user.telefono || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={(user.role || '').charAt(0).toUpperCase() + (user.role || '').slice(1)}
                        color={getRoleColor(user.role || '')}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.activo ? 'Activo' : 'Inactivo'}
                        color={user.activo ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenDialog(user)}
                        title="Editar usuario"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="warning"
                        onClick={() => {
                          setPasswordChangeUser(user);
                          setShowPasswordChange(true);
                        }}
                        title="Cambiar contraseña"
                      >
                        <LockIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Eliminar usuario"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Modal para Crear/Editar Usuario */}
      <Modal
        titulo={editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
        abierto={openDialog}
        onCerrar={handleCloseDialog}
        tamanio="sm"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Input
            etiqueta="Nombres"
            valor={formData.nombres}
            onChange={(v) => setFormData({ ...formData, nombres: v })}
            requerido
          />
          <Input
            etiqueta="Apellidos"
            valor={formData.apellidos}
            onChange={(v) => setFormData({ ...formData, apellidos: v })}
            requerido
          />
          <Input
            etiqueta="Email"
            tipo="email"
            valor={formData.email}
            onChange={(v) => setFormData({ ...formData, email: v })}
            requerido
          />
          {!editingUser && (
            <Input
              etiqueta="Contraseña"
              tipo="password"
              valor={formData.password}
              onChange={(v) => setFormData({ ...formData, password: v })}
              ayuda="Mínimo 6 caracteres"
              requerido
            />
          )}
          <Input
            etiqueta="RUT"
            valor={formData.rut}
            onChange={(v) => setFormData({ ...formData, rut: v })}
            placeholder="12345678-9"
          />
          <Input
            etiqueta="Teléfono"
            tipo="tel"
            valor={formData.telefono}
            onChange={(v) => setFormData({ ...formData, telefono: v })}
            placeholder="+56912345678"
          />
          <Select
            etiqueta="Rol"
            opciones={[
              { valor: 'tutor', etiqueta: 'Tutor' },
              { valor: 'visita', etiqueta: 'Visita' }
            ]}
            valor={formData.rol}
            onChange={(v) => setFormData({ ...formData, rol: v as 'tutor' | 'visita' })}
            requerido
          />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button variante="outline" tamano="md" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              variante="primary"
              tamano="md"
              onClick={handleSaveUser}
              deshabilitado={!formData.nombres || !formData.apellidos || !formData.email}
            >
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal para Cambiar Contraseña */}
      <PasswordChangeModal
        abierto={showPasswordChange}
        onCerrar={() => {
          setShowPasswordChange(false);
          setPasswordChangeUser(null);
        }}
        userId={passwordChangeUser?.id}
        requireCurrentPassword={false}
        onSuccess={() => {
          setSnackbar({ open: true, message: 'Contraseña cambiada exitosamente', severity: 'success' });
          setShowPasswordChange(false);
          setPasswordChangeUser(null);
        }}
      />

      {/* Snackbar */}
      {snackbar.open && (
        <Alert 
          tipo={snackbar.severity === 'error' ? 'error' : 'exito'}
          mensaje={snackbar.message}
          onCerrar={() => setSnackbar({ ...snackbar, open: false })}
        />
      )}
      <ConfirmDialog/>
    </Box>
  );
};

export default UserManagement;