import React, { useState } from 'react';
import { Box, TextField, Button, Alert, CircularProgress, InputAdornment, IconButton, Typography } from '@mui/material';
import { MailOutline as MailIcon, VpnKey as KeyIcon, LockReset as LockIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { Modal } from '../../../ui';
import { authService } from '../../../../services/authService';
import { logger } from '../../../../config';

type Step = 'request' | 'verify' | 'reset';

interface PasswordRecoveryModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onSuccess?: () => void;
}

export const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({
  abierto,
  onCerrar,
  onSuccess
}) => {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const resetModal = () => {
    setStep('request');
    setEmail('');
    setCodigo('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLoading(false);
    setMessage('');
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onCerrar();
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Por favor, ingresa tu email');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      logger.log('📧 Solicitando recuperación de contraseña para:', email);
      await authService.requestPasswordReset(email);
      setMessage('Si el correo está registrado, recibirás un código de recuperación en unos minutos.');
      setStep('verify');
    } catch (error: unknown) {
      logger.error('❌ Error solicitando recuperación:', error);
      setError(error instanceof Error ? error.message : 'Error al solicitar recuperación. Verifica tu email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo) {
      setError('Por favor, ingresa el código');
      return;
    }

    setLoading(true);
    setError('');

    try {
      logger.log('🔑 Verificando código para:', email);
      const isValid = await authService.verifyResetCode(email, codigo);

      if (isValid) {
        logger.log('✅ Código válido, avanzando a nueva contraseña');
        setStep('reset');
      } else {
        setError('Código inválido o expirado');
      }
    } catch (error: unknown) {
      logger.error('❌ Error verificando código:', error);
      setError(error instanceof Error ? error.message : 'Error al verificar el código. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
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

    setLoading(true);
    setError('');

    try {
      logger.log('🔒 Restableciendo contraseña para:', email);
      await authService.resetPassword(email, codigo, password);

      setMessage('Contraseña restablecida exitosamente');
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 2000);

    } catch (error: unknown) {
      logger.error('❌ Error restableciendo contraseña:', error);
      setError(error instanceof Error ? error.message : 'Error al restablecer la contraseña. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'request':
        return 'Recuperar Contraseña';
      case 'verify':
        return 'Verificar Código';
      case 'reset':
        return 'Nueva Contraseña';
      default:
        return 'Recuperar Contraseña';
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'request':
        return <MailIcon sx={{ fontSize: 32, color: '#667eea' }} />;
      case 'verify':
        return <KeyIcon sx={{ fontSize: 32, color: '#667eea' }} />;
      case 'reset':
        return <LockIcon sx={{ fontSize: 32, color: '#667eea' }} />;
      default:
        return <MailIcon sx={{ fontSize: 32, color: '#667eea' }} />;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'request':
        return (
          <Box component="form" onSubmit={handleRequestReset} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" sx={{ textAlign: 'center', color: '#666', mb: 1 }}>
              Ingresa tu email para recibir un código de recuperación. Si no te
              llega ningún correo, confirma que hayas ingresado correctamente tu email.
            </Typography>

            <TextField
              fullWidth
              type="email"
              id="email"
              name="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={loading}
              required
              autoComplete="email"
              variant="outlined"
              error={!!error}
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

            {message && (
              <Alert severity="success" sx={{ mt: 1 }}>
                {message}
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
              {loading ? 'Enviando...' : 'Enviar Código'}
            </Button>
          </Box>
        );

      case 'verify':
        return (
          <Box component="form" onSubmit={handleVerifyCode} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" sx={{ textAlign: 'center', color: '#666', mb: 1 }}>
              Ingresa el código que recibiste en tu email
            </Typography>

            <TextField
              fullWidth
              type="text"
              id="codigo"
              name="codigo"
              label="Código de verificación"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="123456"
              disabled={loading}
              required
              autoComplete="one-time-code"
              variant="outlined"
              error={!!error}
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

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                type="button"
                variant="outlined"
                onClick={() => setStep('request')}
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                Atrás
              </Button>

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
                {loading ? 'Verificando...' : 'Verificar Código'}
              </Button>
            </Box>
          </Box>
        );

      case 'reset':
        return (
          <Box component="form" onSubmit={handleResetPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" sx={{ textAlign: 'center', color: '#666', mb: 1 }}>
              Ingresa tu nueva contraseña
            </Typography>

            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              label="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu nueva contraseña"
              disabled={loading}
              required
              variant="outlined"
              error={!!error}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
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
              label="Confirmar contraseña"
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

            {message && (
              <Alert severity="success" sx={{ mt: 1 }}>
                {message}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                type="button"
                variant="outlined"
                onClick={() => setStep('verify')}
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                Atrás
              </Button>

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
                {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      titulo={getStepTitle()}
      abierto={abierto}
      onCerrar={handleClose}
      tamanio="md"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        {getStepIcon()}
      </Box>
      {renderStepContent()}
    </Modal>
  );
};