import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Alert,
  Link,
  CircularProgress
} from '@mui/material';
import { authService } from '../../../../services/authService';
import type { LoginCredentials } from '../../../../types';
import { logger } from '../../../../config';
import { isValidEmail } from '../../../../utils/validators';
import { LoginFormContainer } from '../shared';
import logoFundacion from '../../../../assets/logos/logo-fundacion.png';

interface LoginAdminFormProps {
  onAuthChange?: (authenticated: boolean) => void;
}

export function LoginAdminForm({ onAuthChange }: LoginAdminFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    logger.log('🔍 Datos del formulario (admin):', { email: credentials.email });
    
    if (!credentials.email || !credentials.password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (!isValidEmail(credentials.email)) {
      setError('Por favor, ingresa un email válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      logger.log('👨‍💼 Intentando login de administrador...');
      await authService.login(credentials);
      logger.log('✅ Login exitoso');
      
      if (onAuthChange) {
        onAuthChange(true);
      }
      
      navigate('/dashboard');
      
    } catch (error: any) {
      logger.error('❌ Error en login:', error);
      setError('Credenciales incorrectas. Por favor, verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginFormContainer
      title="Panel de Administración"
      subtitle="Acceso exclusivo para administradores"
      icon={(
        <Box
          component="img"
          src={logoFundacion}
          alt="Logo Fundación"
          sx={{ height: 160, width: 'auto', borderRadius: 3, boxShadow: 4, backgroundColor: 'rgba(255,255,255,0.98)', p: 2, mx: 'auto' }}
        />
      )}
      gradientColors={{ from: '#65B39B', to: '#C7654F' }}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          fullWidth
          type="email"
          id="email"
          name="email"
          label="Email de Administrador"
          value={credentials.email}
          onChange={handleInputChange}
          placeholder="admin@fundacion.cl"
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

        <TextField
          fullWidth
          type="password"
          id="password"
          name="password"
          label="Contraseña de Administrador"
          value={credentials.password}
          onChange={handleInputChange}
          placeholder="Contraseña segura"
          disabled={loading}
          required
          autoComplete="current-password"
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
            background: 'linear-gradient(135deg, #65B39B 0%, #C7654F 100%)',
            fontWeight: 600,
            fontSize: '1rem',
            textTransform: 'none',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(101, 179, 155, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(101, 179, 155, 0.4)',
              background: 'linear-gradient(135deg, #65B39B 0%, #C7654F 100%)'
            },
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
              transform: 'none'
            }
          }}
        >
          {loading ? 'Verificando credenciales...' : 'Acceder al Panel'}
        </Button>

        <Box sx={{ mt: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => navigate('/solicitar-recuperacion')}
            sx={{
              color: '#65B39B',
              textDecoration: 'underline',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
              '&:hover': {
                color: '#C7654F'
              }
            }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => navigate('/')}
            sx={{
              color: '#65B39B',
              textDecoration: 'underline',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
              '&:hover': {
                color: '#C7654F'
              }
            }}
          >
            ← Volver al login general
          </Link>
        </Box>
      </Box>
    </LoginFormContainer>
  );
};