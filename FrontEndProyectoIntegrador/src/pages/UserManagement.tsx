import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService, PermissionService } from '../services';
import type { Usuario } from '../types';
// TODO: migrate Table*
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Modal, Input, Select, Button, Alert } from '../components/ui';
import { PasswordChangeModal } from '../components/features/auth/password-recovery';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
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
    [UserRol.ESTUDIANTE]: 'bg-yellow-100 text-yellow-700',
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
  const [usuario, setUsuario] = useState<Usuario | null>(null);

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
    const user = await authService.fetchCurrentUser();
    if (!user) { navigate('/'); return; }

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
      const mappedUsers = usersData.map((user) => ({
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
    if (tabValue === 'todos') setFilteredUsers(users);
    else if (tabValue === 'tutores') setFilteredUsers(users.filter(u => u.rol === UserRol.TUTOR));
    else setFilteredUsers(users.filter(u => u.rol === UserRol.VISITA ));
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
        rol:       user.rol as UserRolType,
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
      type UserPayload = {
        rut_usuario: string;
        nombre: string;
        apellido: string;
        email: string;
        telefono: string;
        rol: UserRolType;
        password?: string;
      };
      const userData: UserPayload = {
        rut_usuario: formData.rut,
        nombre:      formData.nombres,
        apellido:    formData.apellidos,
        email:       formData.email,
        telefono:    formData.telefono,
        rol:         formData.rol as UserRolType,
        password:    formData.password || undefined,
      };

      if (editingUser) {
        const updateData: UserPayload = { ...userData };
        if (!updateData.password) delete updateData.password;
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#FFFBF0]/90 rounded-2xl">
      {/* Marcos de fondo */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img src={marcoIzquierdo} alt="" className="absolute left-0 top-0 h-screen w-auto max-w-none opacity-35 select-none hidden md:block" />
        <img src={marcoDerecho}   alt="" className="absolute right-0 top-0 h-screen w-auto max-w-none opacity-35 select-none hidden md:block" />
      </div>

      <BackgroundParticles />

      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-6 lg:px-8 py-8 w-full">

        {/* Cabecera degradado */}
        <div
          className="mb-6 rounded-2xl p-6 flex items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, #65B39B 0%, #4a9e87 40%, #C7654F 100%)' }}
        >
          <div>
            <TypingText
              component="h2"
              text="Gestión de Usuarios"
              startDelayMs={0}
              charDelayMs={1}
              sx={{ display: 'block', fontSize: '1.875rem', fontWeight: 700, color: '#fff' }}
            />
            <p className="text-white/80 text-sm font-medium mt-1">
              Administra tutores y visitantes de la plataforma
            </p>
          </div>
          <button
            onClick={() => handleOpenDialog()}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 border border-white/30 hover:border-white/50 whitespace-nowrap"
          >
            <AddIcon fontSize="small" />
            Agregar Usuario
          </button>
        </div>

        {/* Filtro por rol */}
        <div
          className="mb-8 bg-white rounded-xl px-5 py-4 space-y-3"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filtrar usuarios</p>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={tabValue}
              onChange={(e) => setTabValue(e.target.value as 'todos' | 'tutores' | 'visitas')}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B] transition-colors flex-1 min-w-[140px] max-w-xs"
            >
              <option value="todos">Todos ({users.length})</option>
              <option value="tutores">Tutores ({users.filter(u => u.rol === UserRol.TUTOR).length})</option>
              <option value="visitas">Visitas ({users.filter(u => u.rol === UserRol.VISITA).length})</option>
            </select>
          </div>
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
