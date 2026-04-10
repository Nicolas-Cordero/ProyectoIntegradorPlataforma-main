import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import PermissionService  from '../services/permissionService';
import type { Usuario } from '../types';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Chip,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Build as BuildIcon
} from '@mui/icons-material';

/**
 * PÁGINA DE DEBUG DE PERMISOS
 * Ruta temporal: /debug-permissions
 * 
 * Muestra toda la información sobre autenticación y permisos
 * del usuario actual para facilitar el diagnóstico de problemas
 */
export const DebugPermissions: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Usuario | null>(null);
  const [newRole, setNewRole] = useState<string>('admin');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleFixRole = () => {
    if (!user) return;
    
    const updatedUser = { ...user, role: newRole as 'admin' | 'tutor' | 'invitado' };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    alert(`✅ Rol cambiado a: ${newRole}\n🔄 Recarga la página para ver los cambios`);
  };

  const handleClearAll = () => {
    if (window.confirm('¿Seguro que quieres limpiar todo y cerrar sesión?')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const getDetectedRole = () => {
    if (!user) return null;
    return user.role || null;
  };

  const permissions = user ? {
    'Acceder a Dashboard': PermissionService.canAccessDashboard(user),
    'Gestionar Usuarios': PermissionService.canManageUsers(user),
    'Crear Estudiantes': PermissionService.canCreateStudent(user),
    'Editar Estudiantes': PermissionService.canEditStudent(user),
    'Eliminar Estudiantes': PermissionService.canDeleteStudent(user),
    'Ver Entrevistas': PermissionService.canViewInterviews(user),
    'Crear Entrevistas': PermissionService.canCreateInterview(user),
    'Ver Reportes': PermissionService.canViewReports(user),
    'Exportar Datos': PermissionService.canExportData(user),
  } : {};

  const detectedRole = getDetectedRole();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f0f2f5', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BuildIcon sx={{ fontSize: 40, color: '#ECB876' }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              🔍 Debug de Permisos
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
          >
            ← Volver al Dashboard
          </Button>
        </Box>

        {/* Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Esta página es temporal para diagnosticar problemas de permisos.
          Si todo funciona correctamente, puedes eliminar esta ruta.
        </Alert>

        {/* Estado de Autenticación */}
        <Paper sx={{ mb: 3, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            🔐 Estado de Autenticación
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                Token (accesstoken):
              </Typography>
              {localStorage.getItem('accesstoken') ? (
                <Chip icon={<CheckIcon />} label="Presente" color="success" />
              ) : (
                <Chip icon={<CancelIcon />} label="Ausente" color="error" />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                Usuario:
              </Typography>
              {user ? (
                <Chip icon={<CheckIcon />} label="Cargado" color="success" />
              ) : (
                <Chip icon={<CancelIcon />} label="No encontrado" color="error" />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                Autenticado:
              </Typography>
              {authService.isAuthenticated() ? (
                <Chip icon={<CheckIcon />} label="SÍ" color="success" />
              ) : (
                <Chip icon={<CancelIcon />} label="NO" color="error" />
              )}
            </Box>
          </Box>
        </Paper>

        {/* Datos del Usuario */}
        {user && (
          <Paper sx={{ mb: 3, p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              👤 Datos del Usuario
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell>{user.id || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell>{user.email || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombres</TableCell>
                    <TableCell>{user.nombres || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Apellidos</TableCell>
                    <TableCell>{user.apellidos || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>RUT</TableCell>
                    <TableCell>{user.rut || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow sx={{ backgroundColor: '#fff3cd' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>user.role</TableCell>
                    <TableCell>
                      <strong>{user.role || '❌ NO DEFINIDO'}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Alert 
              severity={detectedRole ? 'success' : 'error'} 
              sx={{ mt: 2 }}
            >
              <strong>Rol Detectado:</strong> {detectedRole || '❌ NINGUNO (Este es el problema!)'}
            </Alert>
          </Paper>
        )}

        {/* Verificación de Roles */}
        {user && (
          <Paper sx={{ mb: 3, p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              🎭 Verificación de Roles
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                  ¿Es Admin?
                </Typography>
                {PermissionService.isAdmin(user) ? (
                  <Chip icon={<CheckIcon />} label="SÍ" color="success" />
                ) : (
                  <Chip icon={<CancelIcon />} label="NO" color="error" />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                  ¿Es Tutor?
                </Typography>
                {PermissionService.isTutor(user) ? (
                  <Chip icon={<CheckIcon />} label="SÍ" color="success" />
                ) : (
                  <Chip icon={<CancelIcon />} label="NO" color="default" />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                  ¿Es Invitado?
                </Typography>
                {PermissionService.isInvitado(user) ? (
                  <Chip icon={<CheckIcon />} label="SÍ" color="success" />
                ) : (
                  <Chip icon={<CancelIcon />} label="NO" color="default" />
                )}
              </Box>
            </Box>
          </Paper>
        )}

        {/* Permisos */}
        {user && (
          <Paper sx={{ mb: 3, p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              ✅ Permisos del Usuario
            </Typography>
            
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
                        {hasPermission ? (
                          <Chip icon={<CheckIcon />} label="Permitido" color="success" size="small" />
                        ) : (
                          <Chip icon={<CancelIcon />} label="Denegado" color="error" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Herramientas de Corrección */}
        <Card sx={{ mb: 3, borderLeft: '4px solid #ECB876' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon sx={{ color: '#ECB876' }} />
              Herramientas de Corrección Temporal
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>⚠️ Advertencia:</strong> Estos cambios son temporales y solo afectan a localStorage.
              Para cambios permanentes, modifica el usuario en el backend.
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Cambiar rol a...</InputLabel>
                <Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  label="Cambiar rol a..."
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="tutor">Tutor</MenuItem>
                  <MenuItem value="invitado">Invitado</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="contained"
                onClick={handleFixRole}
                disabled={!user}
                color="warning"
              >
                Aplicar Cambio
              </Button>
            </Box>

            <Button
              variant="outlined"
              color="error"
              onClick={handleClearAll}
              fullWidth
            >
              🗑️ Limpiar Todo y Cerrar Sesión
            </Button>
          </CardContent>
        </Card>

        {/* Recomendaciones */}
        <Paper sx={{ p: 3, backgroundColor: '#e3f2fd' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            💡 Recomendaciones
          </Typography>
          
          <Typography variant="body2" component="div">
            <ul>
              <li>
                <strong>Si el rol no se detecta:</strong> Verifica que el backend esté devolviendo
                el campo `role` o `rol` en la respuesta del login.
              </li>
              <li>
                <strong>Si eres admin pero no tienes permisos:</strong> Usa las herramientas de
                corrección arriba para cambiar temporalmente tu rol a "admin".
              </li>
              <li>
                <strong>Para solución permanente:</strong> Actualiza el rol del usuario directamente
                en la base de datos del backend.
              </li>
              <li>
                <strong>Verifica en el backend:</strong> Asegúrate de que el endpoint `/auth/login`
                devuelva un objeto de usuario con la propiedad `role` o `rol`.
              </li>
            </ul>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default DebugPermissions;
