import React, { useState } from 'react';
import { Box, TextField, Button, Alert, CircularProgress, InputAdornment, IconButton, Typography } from '@mui/material';
import { LockReset as LockIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { Modal } from '../../../ui';
import { userService } from '../../../../services/user.service';
import { logger } from '../../../../config';

interface PasswordChangeModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onSuccess?: () => void;
  requireCurrentPassword?: boolean;
  userId: string;
  // Modo cambio obligatorio (primer ingreso): no se puede cerrar ni cancelar.
  forzado?: boolean;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  abierto,
  onCerrar,
  onSuccess,
  requireCurrentPassword = true,
  userId,
  forzado = false,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const resetModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setLoading(false);
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onCerrar();
  };




  const validate = (): string | null => {
    if (requireCurrentPassword && !currentPassword) return 'Por favor, ingresa tu contraseña actual';
    if (!newPassword || !confirmPassword)            return 'Por favor, completa todos los campos';
    if (newPassword !== confirmPassword)             return 'Las contraseñas no coinciden';
    if (newPassword.length < 8)                     return 'La nueva contraseña debe tener al menos 8 caracteres';
    if (requireCurrentPassword && currentPassword === newPassword) return 'La nueva contraseña debe ser diferente a la actual';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      logger.log('🔒 Cambiando contraseña');
      
      if (requireCurrentPassword && userId) {
        // User changing their own password
        await userService.changeOwnPassword(userId, currentPassword, newPassword);
      } else if (userId) {
        // Admin changing another user's password
        await userService.changeUserPassword(userId, newPassword);
      }

      resetModal();
      onCerrar();
      onSuccess?.();

    } catch (error: unknown) {
      logger.error('❌ Error cambiando contraseña:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar contraseña';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      titulo={forzado ? 'Cambia tu contraseña' : 'Cambiar Contraseña'}
      abierto={abierto}
      onCerrar={forzado ? () => {} : handleClose}
      tamanio="md"
      mostrarBotonCerrar={!forzado}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <LockIcon sx={{ fontSize: 32, color: '#667eea' }} />
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="body2" sx={{ textAlign: 'center', color: '#666', mb: 1 }}>
          {forzado
            ? 'Por seguridad, debes cambiar tu contraseña inicial antes de continuar.'
            : requireCurrentPassword
              ? 'Ingresa tu contraseña actual y la nueva contraseña'
              : 'Ingresa la nueva contraseña para el usuario'
          }
        </Typography>

        {requireCurrentPassword && (
          <TextField
            fullWidth
            type={showCurrentPassword ? 'text' : 'password'}
            id="currentPassword"
            name="currentPassword"
            label="Contraseña actual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Tu contraseña actual"
            disabled={loading}
            required
            variant="outlined"
            error={!!error}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    edge="end"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f8f9fa',
                '&:hover': {
                  backgroundColor: '#FFFEF5'
                },
                '&.Mui-focused': {
                  backgroundColor: '#FFFEF5'
                }
              }
            }}
          />
        )}

        <TextField
          fullWidth
          type={showNewPassword ? 'text' : 'password'}
          id="newPassword"
          name="newPassword"
          label="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Tu nueva contraseña"
          disabled={loading}
          required
          variant="outlined"
          error={!!error}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f8f9fa',
              '&:hover': {
                backgroundColor: '#FFFEF5'
              },
              '&.Mui-focused': {
                backgroundColor: '#FFFEF5'
              }
            }
          }}
        />

        <TextField
          fullWidth
          type={showConfirmPassword ? 'text' : 'password'}
          id="confirmPassword"
          name="confirmPassword"
          label="Confirmar nueva contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirma tu nueva contraseña"
          disabled={loading}
          required
          variant="outlined"
          error={!!error}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f8f9fa',
              '&:hover': {
                backgroundColor: '#FFFEF5'
              },
              '&.Mui-focused': {
                backgroundColor: '#FFFEF5'
              }
            }
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          {!forzado && (
            <Button
              fullWidth
              type="button"
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              Cancelar
            </Button>
          )}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                transform: 'none'
              }
            }}
          >
            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};