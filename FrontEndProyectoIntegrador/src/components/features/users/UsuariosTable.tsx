import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import type { Usuario, UserRolType } from '../../../types';
import { UserRol } from '../../../types';
import userSvg from '../../../assets/icons/user.svg';

const getRoleChipClasses = (role: UserRolType): string => {
  const map: Record<string, string> = {
    [UserRol.ADMIN]:      'bg-red-100 text-red-700',
    [UserRol.TUTOR]:      'bg-blue-100 text-blue-700',
    [UserRol.VISITA]:     'bg-sky-100 text-sky-700',
    [UserRol.ESTUDIANTE]: 'bg-yellow-100 text-yellow-700',
  };
  return map[role] ?? 'bg-gray-100 text-gray-600';
};

const formatRol = (rol?: string): string =>
  rol ? rol.charAt(0).toUpperCase() + rol.slice(1).toLowerCase() : '-';

interface UsuariosTableProps {
  usuarios: Usuario[];
  currentUserRut?: string;
  // Las acciones son opcionales: si no se pasan, la tabla es de solo lectura
  // (se usa así para el listado de estudiantes).
  onEdit?: (usuario: Usuario) => void;
  onChangePassword?: (usuario: Usuario) => void;
  onDelete?: (rut: string) => void;
  emptyMessage?: string;
}

export const UsuariosTable: React.FC<UsuariosTableProps> = ({
  usuarios,
  currentUserRut,
  onEdit,
  onChangePassword,
  onDelete,
  emptyMessage = 'No hay registros',
}) => {
  const mostrarAcciones = !!(onEdit || onChangePassword || onDelete);
  const columnas = ['Usuario', 'Email', 'RUT', 'Teléfono', 'Rol', ...(mostrarAcciones ? ['Acciones'] : [])];

  return (
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
            {columnas.map((col) => (
              <TableCell
                key={col}
                align={col === 'Acciones' ? 'center' : 'left'}
                sx={{ fontWeight: 600, color: '#1f2937' }}
              >
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnas.length} align="center" sx={{ py: 4 }}>
                <div className="flex flex-col items-center gap-2">
                  <img src={userSvg} alt="Sin registros" className="w-16 h-16 opacity-30 mb-2" />
                  <p className="text-gray-500 font-medium">{emptyMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            usuarios.map((u) => {
              const isSelf   = u.rut_usuario === currentUserRut;
              const isAdmin  = u.rol === UserRol.ADMIN;
              const isLocked = isSelf || isAdmin;
              return (
                <TableRow key={u.rut_usuario} hover sx={{ '&:hover': { backgroundColor: 'rgba(101,179,155,0.04)' } }}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[rgba(101,179,155,0.2)]">
                        <img src={userSvg} alt="Usuario" className="w-6 h-6 object-contain" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-800">{u.nombre} {u.apellido}</p>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[rgba(101,179,155,0.15)] text-[#3d8a72]">Tú</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {u.created_at && `Desde ${new Date(u.created_at).toLocaleDateString('es-CL')}`}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell sx={{ color: '#6b7280' }}>{u.email}</TableCell>
                  <TableCell sx={{ color: '#6b7280' }}>{u.rut_usuario || '-'}</TableCell>
                  <TableCell sx={{ color: '#6b7280' }}>{u.telefono || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleChipClasses(u.rol as UserRolType)}`}>
                      {formatRol(u.rol)}
                    </span>
                  </TableCell>
                  {mostrarAcciones && (
                    <TableCell align="center">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(u)}
                          title={isSelf ? 'No puedes editar tu propio usuario' : isAdmin ? 'No se puede editar a otro administrador' : 'Editar usuario'}
                          disabled={isLocked}
                          className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                          <EditIcon fontSize="small" />
                        </button>
                      )}
                      {onChangePassword && (
                        <button
                          onClick={() => onChangePassword(u)}
                          title={isSelf ? 'Cambia tu contraseña desde tu perfil' : isAdmin ? 'No se puede cambiar la contraseña de otro administrador' : 'Cambiar contraseña'}
                          disabled={isLocked}
                          className="p-1.5 rounded-full text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                          <LockIcon fontSize="small" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(u.rut_usuario)}
                          title={isSelf ? 'No puedes eliminar tu propio usuario' : 'Eliminar usuario'}
                          disabled={isSelf}
                          className="p-1.5 rounded-full text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsuariosTable;
