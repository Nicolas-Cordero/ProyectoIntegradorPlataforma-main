import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService, PermissionService } from '../services';
import type { Usuario } from '../types';
import { Modal, Input, Select, Button, Alert } from '../components/ui';
import { PasswordChangeModal } from '../components/features/auth/password-recovery';
import { UsuariosTable } from '../components/features/users/UsuariosTable';
import { Add as AddIcon } from '@mui/icons-material';
import { TypingText } from '../components/common/TypingText';
import { useConfirmDialog } from '../components/ui';
import { BackgroundParticles } from '../components/common/Particles';
import marcoIzquierdo from '../assets/frames/marco-izquierda.svg';
import marcoDerecho from '../assets/frames/mardo-derecha.svg';
import { UserRol, type UserRolType } from '../types';

type Vista = 'usuarios' | 'estudiantes';

export const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  const [users, setUsers] = useState<Usuario[]>([]);
  const [vista, setVista] = useState<Vista>('usuarios');
  const [search, setSearch] = useState('');
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
    rut: '',
    telefono: '',
    rol: UserRol.TUTOR as UserRolType,
  });

  useEffect(() => { loadData(); }, []);

  // Como cada estudiante tiene su usuario (rol ESTUDIANTE), GET /users devuelve a
  // todos juntos; aquí los separamos en las dos vistas.
  const noEstudiantes = useMemo(() => users.filter((u) => u.rol !== UserRol.ESTUDIANTE), [users]);
  const estudiantes   = useMemo(() => users.filter((u) => u.rol === UserRol.ESTUDIANTE), [users]);

  const visibleList = useMemo(() => {
    const base = vista === 'usuarios' ? noEstudiantes : estudiantes;
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((u) => `${u.nombre} ${u.apellido}`.toLowerCase().includes(q));
  }, [vista, search, noEstudiantes, estudiantes]);

  const cambiarVista = (nueva: Vista) => {
    setVista(nueva);
    setSearch('');
  };

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
      setUsers(usersData);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setSnackbar({ open: true, message: 'Error al cargar usuarios', severity: 'error' });
    }
  };

  const handleOpenDialog = (user?: Usuario) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombres:   user.nombre || '',
        apellidos: user.apellido || '',
        email:     user.email,
        rut:       user.rut_usuario || '',
        telefono:  user.telefono || '',
        rol:       user.rol as UserRolType,
      });
    } else {
      setEditingUser(null);
      setFormData({ nombres: '', apellidos: '', email: '', rut: '', telefono: '', rol: UserRol.TUTOR });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({ nombres: '', apellidos: '', email: '', rut: '', telefono: '', rol: UserRol.TUTOR });
  };

  const handleSaveUser = async () => {
    if (!formData.nombres || !formData.apellidos || !formData.email) {
      setSnackbar({ open: true, message: 'Por favor completa los campos obligatorios', severity: 'error' });
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
      };
      const userData: UserPayload = {
        rut_usuario: formData.rut,
        nombre:      formData.nombres,
        apellido:    formData.apellidos,
        email:       formData.email,
        telefono:    formData.telefono,
        rol:         formData.rol as UserRolType,
      };

      if (editingUser) {
        await userService.update(editingUser.rut_usuario!, userData);
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

  const tabClasses = (activa: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
      activa ? 'bg-[#65B39B] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
    }`;

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
              Administra a los usuarios y revisa a los estudiantes de la plataforma
            </p>
          </div>
          {vista === 'usuarios' && (
            <button
              onClick={() => handleOpenDialog()}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 border border-white/30 hover:border-white/50 whitespace-nowrap"
            >
              <AddIcon fontSize="small" />
              Agregar Usuario
            </button>
          )}
        </div>

        {/* Navbar (usuarios / estudiantes) + búsqueda por nombre */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="inline-flex rounded-xl bg-white p-1 border border-gray-200" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <button onClick={() => cambiarVista('usuarios')} className={tabClasses(vista === 'usuarios')}>
              Usuarios ({noEstudiantes.length})
            </button>
            <button onClick={() => cambiarVista('estudiantes')} className={tabClasses(vista === 'estudiantes')}>
              Estudiantes ({estudiantes.length})
            </button>
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B] transition-colors"
            />
          </div>
        </div>

        {/* Tabla reutilizable. En "estudiantes" la única acción es cambiar la contraseña;
            editar y eliminar quedan solo para la vista de usuarios. */}
        <UsuariosTable
          usuarios={visibleList}
          currentUserRut={usuario?.rut_usuario}
          onEdit={vista === 'usuarios' ? handleOpenDialog : undefined}
          onChangePassword={(u) => { setPasswordChangeUser(u); setShowPasswordChange(true); }}
          onDelete={vista === 'usuarios' ? handleDeleteUser : undefined}
          emptyMessage={
            search.trim()
              ? 'No hay resultados para tu búsqueda'
              : vista === 'usuarios' ? 'No hay usuarios registrados' : 'No hay estudiantes registrados'
          }
        />
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
            <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              La contraseña inicial será el <strong>RUT sin dígito verificador</strong>.
              El usuario deberá cambiarla en su primer ingreso.
            </p>
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
