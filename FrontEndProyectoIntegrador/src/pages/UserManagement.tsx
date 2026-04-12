import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService, PermissionService } from '../services';
import type { Usuario } from '../types';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  Avatar,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
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
import logoFundacion from '../assets/logos/logo.svg';
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
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordUser, setPasswordUser] = useState<Usuario | null>(null);
  const [newPassword, setNewPassword] = useState('');
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
      setUsers(usersData);
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
      setFilteredUsers(users.filter(u => u.role === 'invitado')); 
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
        rol: user.role as 'tutor' | 'visita'
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

  const handleOpenPasswordDialog = (user: Usuario) => {
    setPasswordUser(user);
    setNewPassword('');
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setPasswordUser(null);
    setNewPassword('');
  };

  const handleChangePassword = async () => {
    if (!passwordUser || !newPassword.trim()) {
      setSnackbar({ open: true, message: 'Por favor ingresa una nueva contraseña', severity: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setSnackbar({ open: true, message: 'La contraseña debe tener al menos 6 caracteres', severity: 'error' });
      return;
    }

    try {
      await userService.changeUserPassword(passwordUser.id!, newPassword);
      setSnackbar({ open: true, message: 'Contraseña actualizada exitosamente', severity: 'success' });
      handleClosePasswordDialog();
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      setSnackbar({ open: true, message: 'Error al cambiar la contraseña', severity: 'error' });
    }
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
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#FFFBF0' }}>
      {/* Marcos de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <img
          src={marcoIzquierdo}
          alt=""
          className="absolute left-0 top-0 h-screen w-auto max-w-none opacity-35 select-none hidden md:block"
        />
        <img
          src={marcoDerecho}
          alt=""
          className="absolute right-0 top-0 h-screen w-auto max-w-none opacity-35 select-none hidden md:block"
        />
      </div>

      {/* Partículas */}
      <DashboardParticles />

      {/* Navbar estilo Dashboard */}
      <AppBar
        position="relative"
        elevation={0}
        className="navbar-blur-effect"
        sx={{
          zIndex: 20,
          background: `
            linear-gradient(135deg, #65B39B 0%, #5a9d89 50%, #4f8a77 100%),
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.1) 0%, transparent 50%)
          `,
          backgroundAttachment: 'fixed',
          color: 'white',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: `
            0 8px 32px 0 rgba(31, 38, 135, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
            pointerEvents: 'none'
          }
        }}
      >
        <Toolbar sx={{ 
          px: { xs: 1.5, sm: 2, md: 3 }, 
          py: { xs: 1, md: 1.5 }, 
          minHeight: 'auto', 
          alignItems: 'center', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: { xs: 0.75, md: 2 },
          position: 'relative',
          zIndex: 1
        }}>
          {/* Fila 1: Logo + Fundación Carmen Goudie + Dashboard */}
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: { xs: 0.75, sm: 1, md: 1.5 }, width: { xs: '100%', md: 'auto' }, flexGrow: { xs: 1, md: 1 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 },
                flexShrink: 0,
              }}
              onClick={() => navigate('/dashboard')}
            >
              <Box
                component="img"
                src={logoFundacion}
                alt="Logo Fundación"
                sx={{
                  width: { xs: 40, sm: 56, md: 64 },
                  height: { xs: 40, sm: 56, md: 64 },
                  cursor: 'pointer',
                  objectFit: 'contain',
                  flexShrink: 0,
                  '&:hover': { opacity: 0.9 }
                }}
                onClick={() => navigate('/dashboard')}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1 }}>
                <TypingText
                  component="span"
                  text="Fundación"
                  startDelayMs={0}
                  charDelayMs={1}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '0.7rem', sm: '0.85rem', md: '0.95rem', lg: '1rem' },
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    textShadow: '0 2px 5px rgba(0, 0, 0, 0.34), 0 0 1px rgba(0, 0, 0, 0.18)',
                  }}
                />
                <TypingText
                  component="span"
                  text="Carmen Goudie"
                  startDelayMs={15}
                  charDelayMs={1}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '0.7rem', sm: '0.85rem', md: '0.95rem', lg: '1rem' },
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    textShadow: '0 2px 5px rgba(0, 0, 0, 0.34), 0 0 1px rgba(0, 0, 0, 0.18)',
                  }}
                />
              </Box>
            </Box>

            {/* Botón Dashboard - Empujado a la derecha */}
            <Box sx={{ ml: 'auto', flexShrink: 0 }}>
              <GradientButton
                className="gradient-subtle-hover"
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/dashboard')}
                fullWidth={false}
                gradientVariant={1}
                sx={{ minHeight: { xs: 40, sm: 48, md: 72 }, minWidth: { xs: 100, sm: 150, md: 280 }, fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' }, flexShrink: 0 }}
              >
                Dashboard
              </GradientButton>
            </Box>
          </Box>

          {/* Fila 2: Información de usuario y acciones */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 0.75, md: 1 }, ml: { xs: 0, md: 'auto' }, flexShrink: 0, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
            {showAdminChip && (
              <Chip
                label={
                  <Box component="span">
                    <Box component="span" sx={{ opacity: 0.8 }}>Admin:</Box>
                    {' '}
                    <Box component="span" sx={{ fontWeight: 600 }}>{usuario?.email || 'Cargando...'}</Box>
                  </Box>
                }
                sx={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  fontSize: '0.8rem',
                  height: 30,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '& .MuiChip-label': {
                    px: 1.25,
                  },
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.18)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1)'
                  }
                }}
              />
            )}

            <Button
              variant="text"
              className="navbar-button button-wave-effect"
              startIcon={<AccountCircleIcon />}
              onClick={() => navigate('/perfil')}
              title="Ver perfil"
              sx={{
                color: 'white',
                textTransform: 'none',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                minHeight: { xs: 38, sm: 42, md: 44 },
                px: { xs: 0.5, sm: 1, md: 1.5 },
                fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' },
                flex: { xs: 1, md: 'none' },
                '& .MuiButton-startIcon': {
                  mr: { xs: 0.3, sm: 0.5, md: 0.75 },
                  '& svg': {
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                  },
                },
                whiteSpace: 'nowrap',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-1px)',
                  '&::before': {
                    left: '100%'
                  }
                }
              }}
            >
              Perfil
            </Button>

            <Button
              variant="contained"
              className="navbar-button button-wave-effect"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                background: 'linear-gradient(135deg, #C7654F 0%, #a84a38 100%)',
                color: 'white',
                textTransform: 'none',
                fontWeight: 500,
                minHeight: { xs: 38, sm: 42, md: 44 },
                px: { xs: 0.5, sm: 1, md: 1.5 },
                fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' },
                flex: { xs: 1, md: 'none' },
                '& .MuiButton-startIcon': {
                  mr: { xs: 0.3, sm: 0.5, md: 0.75 },
                  '& svg': {
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                  },
                },
                boxShadow: '0 4px 12px rgba(199, 101, 79, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d97a5f 0%, #b85842 100%)',
                  boxShadow: '0 8px 24px rgba(199, 101, 79, 0.4)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

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

        {/* Navbar de Tabs estilo Dashboard */}
        <Paper sx={{ 
          mb: 6, 
          borderRadius: 2,
          background: `
            linear-gradient(135deg, rgba(238, 179, 93, 0.15) 0%, rgba(238, 179, 93, 0.08) 100%),
            rgba(255, 255, 255, 0.85)
          `,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(238, 179, 93, 0.3)',
          boxShadow: '0 8px 32px rgba(238, 179, 93, 0.12)'
        }}>
          <Tabs 
            value={tabValue} 
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ 
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
                background: 'linear-gradient(135deg, #f9b150 0%, #EEB35D 100%)',
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
              label={`Visitas (${users.filter(u => u.role === 'invitado').length})`}
              value="visitas"
              icon={<VisibilityIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Botón Agregar Usuario */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <GradientButton
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            fullWidth={false}
            gradientVariant={2}
            sx={{ minHeight: { xs: 40, sm: 48, md: 56 }, minWidth: { xs: 140, sm: 180, md: 240 } }}
          >
            Agregar Usuario
          </GradientButton>
        </Box>

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
                        onClick={() => handleOpenPasswordDialog(user)}
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

      {/* Dialog para Crear/Editar Usuario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#1f2937' }}>
          {editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nombres *"
              value={formData.nombres}
              onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Apellidos *"
              value={formData.apellidos}
              onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              variant="outlined"
            />
            {!editingUser && (
              <TextField
                label="Contraseña *"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                fullWidth
                helperText="Mínimo 6 caracteres"
                variant="outlined"
              />
            )}
            <TextField
              label="RUT"
              value={formData.rut}
              onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
              placeholder="12345678-9"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+56912345678"
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>Rol *</InputLabel>
              <Select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'tutor' | 'visita' })}
                label="Rol *"
              >
                <MenuItem value="tutor">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TutorIcon /> Tutor
                  </Box>
                </MenuItem>
                <MenuItem value="visita">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityIcon /> Visita
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined">Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveUser}
            disabled={!formData.nombres || !formData.apellidos || !formData.email}
            sx={{ background: 'linear-gradient(135deg, #65B39B 0%, #4f8a77 100%)' }}
          >
            {editingUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Cambiar Contraseña */}
      <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#1f2937' }}>
          Cambiar Contraseña - {passwordUser?.nombres} {passwordUser?.apellidos}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              helperText="La contraseña debe tener al menos 6 caracteres"
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClosePasswordDialog} variant="outlined">
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleChangePassword}
            disabled={!newPassword.trim() || newPassword.length < 6}
            sx={{ background: 'linear-gradient(135deg, #65B39B 0%, #4f8a77 100%)' }}
          >
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <ConfirmDialog />
    </div>
  );
};

export default UserManagement;