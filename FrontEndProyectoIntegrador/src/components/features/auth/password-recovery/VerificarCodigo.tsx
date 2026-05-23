import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, TextField, Button, Alert, Link, CircularProgress, Typography } from '@mui/material';
import { VpnKey as KeyIcon } from '@mui/icons-material';
import { authService } from '../../../../services/authService';
import { logger } from '../../../../config';
import { LoginFormContainer } from '../shared';

export const VerificarCodigo: React.FC = () => {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigo) {
      setError('Por favor, ingresa el código');
      return;
    }

    if (!email) {
      setError('Email no encontrado. Vuelve a solicitar la recuperación.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      logger.log('🔑 Verificando código para:', email);
      const isValid = await authService.verifyResetCode(email, codigo);
      
      if (isValid) {
        logger.log('✅ Código válido, redirigiendo a nueva contraseña');
        navigate('/nueva-password', { state: { email, codigo } });
      } else {
        setError('Código inválido o expirado');
      }
      
    } catch (error: any) {
      logger.error('❌ Error verificando código:', error);
      setError('Error al verificar el código. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginFormContainer
      title="Verificar Código"
      subtitle="Ingresa el código que recibiste en tu email"
      icon={
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EEB35D 0%, #C7654F 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(199, 101, 79, 0.3)'
          }}
        >
          <KeyIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
      }
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {email && (
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center', 
              color: '#667eea',
              fontWeight: 500,
              mb: 1
            }}
          >
            Código enviado a: <strong>{email}</strong>
          </Typography>
        )}

        <TextField
          fullWidth
          type="text"
          id="codigo"
          name="codigo"
          label="Código de Verificación"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.slice(0, 6))}
          placeholder="123456"
          disabled={loading}
          required
          inputProps={{ maxLength: 6 }}
          variant="outlined"
          error={!!error}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f8f9fa',
              letterSpacing: '0.5em',
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#fff'
              },
              '&.Mui-focused': {
                backgroundColor: '#fff'
              }
            }
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
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
          {loading ? 'Verificando...' : 'Verificar Código'}
        </Button>

        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={() => navigate('/solicitar-recuperacion')}
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
          ← Solicitar nuevo código
        </Link>
      </Box>
    </LoginFormContainer>
  );
};