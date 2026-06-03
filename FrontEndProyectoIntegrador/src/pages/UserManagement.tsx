import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService, PermissionService } from '../services';
import type { Usuario } from '../types';
// TODO: migrate Table*, Tabs, Tab
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
} from '@mui/material';
import { Modal, Input, Select, Button, Alert } from '../components/ui';
import { PasswordChangeModal } from '../components/features/auth/password-recovery';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SupervisorAccount as TutorIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { GradientButton } from '../components/common/GradientButton';
import { TypingText } from '../components/common/TypingText';
import { useConfirmDialog } from '../components/ui';
import { BackgroundParticles } from '../components/common/Particles';
import marcoIzquierdo from '../assets/frames/marco-izquierda.svg';
import marcoDerecho from '../assets/frames/mardo-derecha.svg';
import userSvg from '../assets/icons/user.svg';
import { UserRol, type UserRolType } from '../types';

const getRoleChipClasses = (role: UserRolType): string => {
  const map: Record<string, string> = {
    [UserRol.ADMIN]:      'bg-red-100 text-red-700',
    [UserRol.TUTOR]:      'bg-blue-100 text-blue-700',
    [UserRol.VISITA]:     'bg-sky-100 text-sky-700',
    [UserRol.ACADEMICO]:  'bg-green-100 text-green-700',
    [UserRol.ESTUDIANTE]: 'bg-yellow-100 text-yellow-700',
    [UserRol.INVITADO]:   'bg-gray-100 text-gray-600',
  };
  return map[role] ?? 'bg-gray-100 text-gray-600';
};

export const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

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
    rol: UserRol.TUTOR as UserRolType,
  });

  useEffect(() => { loadData(); }, []);
  useEffect(() => { filterUsers(); }, [tabValue, users]);

  const loadData = async () => {
    if (!authService.isAuthenticated()) { navigate('/'); return; }

    const tokenValid = await authService.verifyToken();
    if (!tokenValid) { navigate('/'); return; }

    const user = authService.getCurrentUser();
    setUsuario(user);

    if (!PermissionService.canManageUsers(user)) {
      setSnackbar({ open: true, message: 'No tienes permisos para acceder a esta sección. Debes ser administrador.', severity: 'error' });
      setTimeout(() => navigate('/estudiantes'), 3000);
      return;
    }

    await loadUsers();
  };

  const loadUsers = async () => {
    try {
      const usersData = await userService.getAll();
      const mappedUsers = (usersData as any[]).map((user) => ({
        ...user,
        role:      user.rol     || user.role     || UserRol.VISITA,
        nombres:   user.nombre  || user.nombres  || '',
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
      setFilteredUsers(users.filter(u => u.rol === UserRol.TUTOR));
    } else {
      setFilteredUsers(users.filter(u => u.rol === UserRol.VISITA || u.rol === UserRol.INVITADO));
    }
  };

  const handleOpenDialog = (user?: Usuario) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombres:   user.nombre || '',
        apellidos: user.apellido || '',
        email:     user.email,
        password:  '',
        rut:       user.rut_usuario || '',
        telefono:  user.telefono || '',
        rol:       (user as any).rol || user.rol as UserRolType,
      });
    } else {
      setEditingUser(null);
      setFormData({ nombres: '', apellidos: '', email: '', password: '', rut: '', telefono: '', rol: UserRol.TUTOR });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({ nombres: '', apellidos: '', email: '', password: '', rut: '', telefono: '', rol: UserRol.TUTOR });
  };

  const handleSaveUser = async () => {
    if (!formData.nombres || !formData.apellidos || !formData.email) {
      setSnackbar({ open: true, message: 'Por favor completa los campos obligatorios', severity: 'error' });
      return;
    }
    if (!editingUser && !formData.password) {
      setSnackbar({ open: true, message: 'La contraseña es obligatoria para nuevos usuarios', severity: 'error' });
      return;
    }

    try {
      const userData = {
        rut_usuario: formData.rut,
        nombre:      formData.nombres,
        apellido:    formData.apellidos,
        email:       formData.email,
        telefono:    formData.telefono,
        rol:         formData.rol as UserRolType,
        password:    formData.password,
      };

      if (editingUser) {
        const updateData = { ...userData };
        if (!updateData.password) delete (updateData as any).password;
        await userService.update(editingUser.rut_usuario!, updateData);
        setSnackbar({ open: true, message: 'Usuario actualizado exitosamente', severity: 'success' });
      } else {
        await userService.create(userData);
        setSnackbar({ open: true, message: `${formData.rol === UserRol.TUTOR ? 'Tutor' : 'Visitante'} creado exitosamente`, severity: 'success' });
      }

      handleCloseDialog();
      await loadUsers();
    } catch (err) {
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
        await loadUsers();
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#FFFBF0' }}>
      {/* Marcos de fondo */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img src={marcoIzquierdo} alt="" className="absolute left-0 top-0 h-screen w-auto max-w-none opacity-35 select-none hidden md:block" />
        <img src={marcoDerecho}   alt="" className="absolute right-0 top-0 h-screen w-auto max-w-none opacity-35 select-none hidden md:block" />
      </div>

      <BackgroundParticles />

      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-6 lg:px-8 py-8 w-full">

        {/* Título */}
        <div className="mb-8">
          <TypingText
            component="h2"
            text="Gestión de Usuarios"
            startDelayMs={0}
            charDelayMs={1}
            sx={{ display: 'block', fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1f2937' }}
          />
          <p className="text-base text-gray-500 font-medium">
            Administra tutores y visitantes de la plataforma
          </p>
        </div>

        {/* Tabs de filtro */}
        {/* TODO: migrate Tabs, Tab */}
        <div
          className="mb-12 rounded-lg border border-[rgba(238,179,93,0.3)]"
          style={{
            background: 'linear-gradient(135deg, rgba(238,179,93,0.15) 0%, rgba(238,179,93,0.08) 100%), rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(238,179,93,0.12)',
          }}
        >
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
                '&.Mui-selected': { color: '#EEB35D', fontWeight: 700 },
                '&:hover': { backgroundColor: 'rgba(238, 179, 93, 0.08)', color: 'rgba(238, 179, 93, 0.9)' },
              },
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(135deg, #f9b150 0%, #EEB35D 100%)',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab label={`Todos (${users.length})`} value="todos" />
            <Tab label={`Tutores (${users.filter(u => u.rol === 'TUTOR').length})`} value="tutores" icon={<TutorIcon />} iconPosition="start" />
            <Tab label={`Visitas (${users.filter(u => u.rol === UserRol.VISITA || u.rol === UserRol.INVITADO).length})`} value="visitas" icon={<VisibilityIcon />} iconPosition="start" />
          </Tabs>
        </div>

        {/* Botón Agregar */}
        <div className="mb-8 flex justify-end">
          <GradientButton
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            fullWidth={false}
            solidColor="#65B39B"
            sx={{ minHeight: { xs: 40, sm: 48, md: 56 }, minWidth: { xs: 140, sm: 180, md: 240 } }}
          >
            Agregar Usuario
          </GradientButton>
        </div>

        {/* Tabla — TODO: migrate Table* */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(101,179,155,0.08)' }}>
              <TableRow>
                {['Usuario', 'Email', 'RUT', 'Teléfono', 'Rol', 'Estado', 'Acciones'].map((col, i) => (
                  <TableCell key={col} align={i === 6 ? 'center' : 'left'} sx={{ fontWeight: 600, color: '#1f2937' }}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <div className="flex flex-col items-center gap-2">
                      <img src={userSvg} alt="Sin usuarios" className="w-16 h-16 opacity-30 mb-2" />
                      <p className="text-gray-500 font-medium">No hay usuarios registrados</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = user.rut_usuario === usuario?.rut_usuario;
                  return (
                  <TableRow key={user.rut_usuario} hover sx={{ '&:hover': { backgroundColor: 'rgba(101,179,155,0.04)' } }}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[rgba(101,179,155,0.2)]">
                          <img src={userSvg} alt="Usuario" className="w-6 h-6 object-contain" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-800">{user.nombre} {user.apellido}</p>
                            {isSelf && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[rgba(101,179,155,0.15)] text-[#3d8a72]">Tú</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {user.created_at && `Desde ${new Date(user.created_at).toLocaleDateString('es-CL')}`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell sx={{ color: '#6b7280' }}>{user.email}</TableCell>
                    <TableCell sx={{ color: '#6b7280' }}>{user.rut_usuario || '-'}</TableCell>
                    <TableCell sx={{ color: '#6b7280' }}>{user.telefono || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleChipClasses(user.rol as UserRolType)}`}>
                        {(user.rol || '').charAt(0).toUpperCase() + (user.rol || '').slice(1)}
                      </span>
                    </TableCell>
                    <TableCell />
                    <TableCell align="center">
                      <button
                        onClick={() => handleOpenDialog(user)}
                        title={isSelf ? 'No puedes editar tu propio usuario' : 'Editar usuario'}
                        disabled={isSelf}
                        className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        <EditIcon fontSize="small" />
                      </button>
                      <button
                        onClick={() => { setPasswordChangeUser(user); setShowPasswordChange(true); }}
                        title={isSelf ? 'Cambia tu contraseña desde tu perfil' : 'Cambiar contraseña'}
                        disabled={isSelf}
                        className="p-1.5 rounded-full text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        <LockIcon fontSize="small" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.rut_usuario!)}
                        title={isSelf ? 'No puedes eliminar tu propio usuario' : 'Eliminar usuario'}
                        disabled={isSelf}
                        className="p-1.5 rounded-full text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Modal Crear/Editar */}
      <Modal
        titulo={editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
        abierto={openDialog}
        onCerrar={handleCloseDialog}
        tamanio="sm"
      >
        <div className="flex flex-col gap-4">
          <Input etiqueta="Nombres"   valor={formData.nombres}   onChange={(v) => setFormData({ ...formData, nombres: v })}   requerido />
          <Input etiqueta="Apellidos" valor={formData.apellidos} onChange={(v) => setFormData({ ...formData, apellidos: v })} requerido />
          <Input etiqueta="Email" tipo="email" valor={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} requerido />
          {!editingUser && (
            <Input etiqueta="Contraseña" tipo="password" valor={formData.password} onChange={(v) => setFormData({ ...formData, password: v })} ayuda="Mínimo 6 caracteres" requerido />
          )}
          <Input etiqueta="RUT"      valor={formData.rut}      onChange={(v) => setFormData({ ...formData, rut: v })}      placeholder="12345678-9" />
          <Input etiqueta="Teléfono" tipo="tel" valor={formData.telefono} onChange={(v) => setFormData({ ...formData, telefono: v })} placeholder="+56912345678" />
          <Select
            etiqueta="Rol"
            opciones={[{ valor: UserRol.TUTOR, etiqueta: 'Tutor' }, { valor: UserRol.VISITA, etiqueta: 'Visita' }]}
            valor={formData.rol}
            onChange={(v) => setFormData({ ...formData, rol: v as UserRolType })}
            requerido
          />
          <div className="flex gap-4 justify-end mt-2">
            <Button variante="outline" tamano="md" onClick={handleCloseDialog}>Cancelar</Button>
            <Button variante="primary" tamano="md" onClick={handleSaveUser} deshabilitado={!formData.nombres || !formData.apellidos || !formData.email}>
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Cambiar Contraseña */}
      {showPasswordChange && passwordChangeUser && (
        <PasswordChangeModal
          abierto={showPasswordChange}
          onCerrar={() => { setShowPasswordChange(false); setPasswordChangeUser(null); }}
          userId={passwordChangeUser.rut_usuario}
          requireCurrentPassword={false}
          onSuccess={() => {
            setSnackbar({ open: true, message: 'Contraseña cambiada exitosamente', severity: 'success' });
            setShowPasswordChange(false);
            setPasswordChangeUser(null);
          }}
        />
      )}

      {snackbar.open && (
        <Alert
          tipo={snackbar.severity === 'error' ? 'error' : 'exito'}
          mensaje={snackbar.message}
          onCerrar={() => setSnackbar({ ...snackbar, open: false })}
        />
      )}
      <ConfirmDialog />
    </div>
  );
};

export default UserManagement;
