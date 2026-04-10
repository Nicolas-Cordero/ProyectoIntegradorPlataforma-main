import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Alert, Link, CircularProgress } from '@mui/material';
import { MailOutline as MailIcon } from '@mui/icons-material';
import { authService } from '../../../../services/authService';
import { logger } from '../../../../config';
import { LoginFormContainer } from '../shared';

export const SolicitarRecuperacion: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
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
      setMessage('Se ha enviado un código de recuperación a tu email');
      
      // Redirigir a verificar código después de 3 segundos
      setTimeout(() => {
        navigate('/verificar-codigo', { state: { email } });
      }, 3000);
      
    } catch (error: any) {
      logger.error('❌ Error solicitando recuperación:', error);
      setError('Error al solicitar recuperación. Verifica tu email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginFormContainer
      title="Recuperar Contraseña"
      subtitle="Ingresa tu email para recibir un código de recuperación"
      icon={<MailIcon sx={{ fontSize: 64, color: '#667eea' }} />}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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

        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={() => navigate('/')}
          sx={{
            mt: 2,
            textAlign: 'center',
            color: '#667eea',
            textDecoration: 'underline',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
            '&:hover': {
              color: '#764ba2'
            }
          }}
        >
          ← Volver al login
        </Link>
      </Box>
    </LoginFormContainer>
  );
};