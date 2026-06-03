import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import PermissionService from '../services/permissionService';
import type { Usuario } from '../types';
// TODO: migrate Alert, Table*, Select, MenuItem, FormControl, InputLabel
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useConfirmDialog } from '../components/ui';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
} from '@mui/icons-material';

/**
 * PÁGINA DE DEBUG DE PERMISOS
 * Ruta temporal: /debug-permissions
 *
 * Muestra toda la información sobre autenticación y permisos
 * del usuario actual para facilitar el diagnóstico de problemas
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusChip({ ok, labelYes, labelNo }: { ok: boolean; labelYes: string; labelNo: string }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      <CheckIcon style={{ fontSize: 14 }} /> {labelYes}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      <CancelIcon style={{ fontSize: 14 }} /> {labelNo}
    </span>
  );
}

function StatusChipNeutral({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      <CheckIcon style={{ fontSize: 14 }} /> SÍ
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
      <CancelIcon style={{ fontSize: 14 }} /> NO
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export const DebugPermissions: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const [user, setUser] = useState<Usuario | null>(null);
  const [newRole, setNewRole] = useState<string>('admin');

  useEffect(() => {
    authService.fetchCurrentUser().then(setUser);
  }, []);

  const handleFixRole = () => {
    alert('⚠️ Cambio de rol local no disponible. El rol se gestiona desde el backend.');
  };

  const handleClearAll = () => {
    showConfirm({
      title: 'Cerrar sesión',
      message: '¿Seguro que quieres cerrar sesión?',
      confirmText: 'Cerrar sesión',
      confirmColor: 'error',
      onConfirm: async () => { await authService.logout(); window.location.href = '/'; },
    });
  };

  const detectedRole = user?.role || null;

  const permissions = user ? {
    'Acceder a Dashboard':  PermissionService.canAccessDashboard(user),
    'Gestionar Usuarios':   PermissionService.canManageUsers(user),
    'Crear Estudiantes':    PermissionService.canCreateStudent(user),
    'Editar Estudiantes':   PermissionService.canEditStudent(user),
    'Eliminar Estudiantes': PermissionService.canDeleteStudent(user),
    'Ver Entrevistas':      PermissionService.canViewInterviews(user),
    'Crear Entrevistas':    PermissionService.canCreateInterview(user),
    'Ver Reportes':         PermissionService.canViewReports(user),
    'Exportar Datos':       PermissionService.canExportData(user),
  } : {};

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BuildIcon style={{ fontSize: 40, color: '#ECB876' }} />
            <h4 className="text-[2.125rem] font-bold">🔍 Debug de Permisos</h4>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-lg border border-gray-400 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            ← Volver al Dashboard
          </button>
        </div>

        {/* Info alert — TODO: migrate Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Esta página es temporal para diagnosticar problemas de permisos.
          Si todo funciona correctamente, puedes eliminar esta ruta.
        </Alert>

        {/* Estado de Autenticación */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h6 className="text-xl font-semibold mb-4">🔐 Estado de Autenticación</h6>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Sesión activa (cookie):', ok: !!user, yes: 'Activa', no: 'Sin sesión' },
              { label: 'Usuario:',                ok: !!user, yes: 'Cargado', no: 'No encontrado' },
            ].map(({ label, ok, yes, no }) => (
              <div key={label} className="flex items-center gap-4">
                <span className="min-w-[150px] font-bold text-sm">{label}</span>
                <StatusChip ok={ok} labelYes={yes} labelNo={no} />
              </div>
            ))}
          </div>
        </div>

        {/* Datos del Usuario — TODO: migrate Table* */}
        {user && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h6 className="text-xl font-semibold mb-4">👤 Datos del Usuario</h6>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {[
                    ['ID',        (user as any).id       || 'N/A'],
                    ['Email',     user.email              || 'N/A'],
                    ['Nombres',   (user as any).nombres   || 'N/A'],
                    ['Apellidos', (user as any).apellidos || 'N/A'],
                    ['RUT',       (user as any).rut       || 'N/A'],
                  ].map(([field, val]) => (
                    <TableRow key={field}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{field}</TableCell>
                      <TableCell>{val}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: '#fff3cd' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>user.role</TableCell>
                    <TableCell><strong>{(user as any).role || '❌ NO DEFINIDO'}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            {/* TODO: migrate Alert */}
            <Alert severity={detectedRole ? 'success' : 'error'} sx={{ mt: 2 }}>
              <strong>Rol Detectado:</strong> {detectedRole || '❌ NINGUNO (Este es el problema!)'}
            </Alert>
          </div>
        )}

        {/* Verificación de Roles */}
        {user && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h6 className="text-xl font-semibold mb-4">🎭 Verificación de Roles</h6>
            <div className="flex flex-col gap-4">
              {[
                { label: '¿Es Admin?',   ok: PermissionService.isAdmin(user) },
                { label: '¿Es Tutor?',   ok: PermissionService.isTutor(user) },
                { label: '¿Es Invitado?', ok: PermissionService.isInvitado(user) },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center gap-4">
                  <span className="min-w-[150px] font-bold text-sm">{label}</span>
                  <StatusChipNeutral ok={ok} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Permisos — TODO: migrate Table* */}
        {user && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h6 className="text-xl font-semibold mb-4">✅ Permisos del Usuario</h6>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Permiso</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(permissions).map(([permission, hasPermission]) => (
                    <TableRow key={permission}>
                      <TableCell>{permission}</TableCell>
                      <TableCell>
                        <StatusChip ok={hasPermission} labelYes="Permitido" labelNo="Denegado" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}

        {/* Herramientas de Corrección */}
        <div className="bg-white rounded-xl shadow mb-6 border-l-4 border-[#ECB876]">
          <div className="p-6">
            <h6 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <WarningIcon style={{ color: '#ECB876' }} />
              Herramientas de Corrección Temporal
            </h6>

            {/* TODO: migrate Alert */}
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>⚠️ Advertencia:</strong> Estos cambios son temporales y solo afectan a localStorage.
              Para cambios permanentes, modifica el usuario en el backend.
            </Alert>

            {/* TODO: migrate Select, MenuItem, FormControl, InputLabel */}
            <div className="flex items-center gap-4 mb-4">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Cambiar rol a...</InputLabel>
                <Select value={newRole} onChange={(e) => setNewRole(e.target.value)} label="Cambiar rol a...">
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="tutor">Tutor</MenuItem>
                  <MenuItem value="invitado">Invitado</MenuItem>
                </Select>
              </FormControl>
              <button
                onClick={handleFixRole}
                disabled={!user}
                className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Aplicar Cambio
              </button>
            </div>

            <button
              onClick={handleClearAll}
              className="w-full px-4 py-2 rounded-lg border border-red-500 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              🗑️ Limpiar Todo y Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="bg-blue-50 rounded-xl shadow p-6">
          <h6 className="text-xl font-semibold mb-4">💡 Recomendaciones</h6>
          <ul className="text-sm space-y-2 list-disc list-inside text-gray-700">
            <li><strong>Si el rol no se detecta:</strong> Verifica que el backend esté devolviendo el campo <code>role</code> o <code>rol</code> en la respuesta del login.</li>
            <li><strong>Si eres admin pero no tienes permisos:</strong> Usa las herramientas de corrección arriba para cambiar temporalmente tu rol a "admin".</li>
            <li><strong>Para solución permanente:</strong> Actualiza el rol del usuario directamente en la base de datos del backend.</li>
            <li><strong>Verifica en el backend:</strong> Asegúrate de que el endpoint <code>/auth/login</code> devuelva un objeto de usuario con la propiedad <code>role</code> o <code>rol</code>.</li>
          </ul>
        </div>

      </div>
      <ConfirmDialog />
    </div>
  );
};

export default DebugPermissions;
