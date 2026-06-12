import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, TextField, Button, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { LockReset as LockIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { authService } from '../../../../services/authService';
import { logger } from '../../../../config';
import { LoginFormContainer } from '../shared';

export const NuevaPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const codigo = location.state?.codigo || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!email || !codigo) {
      setError('Datos de verificación no encontrados. Vuelve a solicitar la recuperación.');
      navigate('/solicitar-recuperacion');
      return;
    }

    setLoading(true);
    setError('');

    try {
      logger.log('🔒 Restableciendo contraseña para:', email);
      await authService.resetPassword(email, codigo, password);
      
      logger.log('✅ Contraseña actualizada exitosamente');
      // Usar Alert de MUI en lugar de alert nativo
      setTimeout(() => {
        navigate('/', { state: { message: 'Contraseña actualizada exitosamente' } });
      }, 2000);
      
    } catch (error: unknown) {
      logger.error('❌ Error restableciendo contraseña:', error);
      setError('Error al restablecer la contraseña. El código puede haber expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginFormContainer
      title="Nueva Contraseña"
      subtitle="Ingresa tu nueva contraseña"
      icon={
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #C7654F 0%, #65B39B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(101, 179, 155, 0.3)'
          }}
        >
          <LockIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
      }
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          id="password"
          name="password"
          label="Nueva Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          disabled={loading}
          required
          variant="outlined"
          error={!!error}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
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
          label="Confirmar Contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repite la contraseña"
          disabled={loading}
          required
          variant="outlined"
          error={!!error && password !== confirmPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
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

        {!error && password && confirmPassword && password === confirmPassword && (
          <Alert severity="success" sx={{ mt: 1 }}>
            Las contraseñas coinciden ✓
          </Alert>
        )}

        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{
            mt: 1,
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
          {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
        </Button>
      </Box>
    </LoginFormContainer>
  );
};