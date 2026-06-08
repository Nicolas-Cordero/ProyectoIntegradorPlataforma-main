import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Link, CircularProgress, Stack } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { Input, Alert, Button } from '../../../ui';
import { authService } from '../../../../services/authService';
import { logger } from '../../../../config';
import type { LoginCredentials } from '../../../../types';
import { LoginFormContainer } from '../shared';
import { PasswordRecoveryModal } from '../password-recovery';
import logoFundacion from '../../../../assets/logos/logo-fundacion.png';

export function LoginForm() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      logger.log('🔐 Intentando iniciar sesión...');
      const response = await authService.login(credentials);
      
      logger.log('✅ Login exitoso, redirigiendo según tipo de usuario...');
      
      switch (response.user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'academico':
          navigate('/academico');
          break;
        case 'estudiante':
          navigate('/estudiante');
          break;
        default:
          setError('Tipo de usuario no reconocido');
      }
      
    } catch (error: any) {
      logger.error('❌ Error en login:', error);
      
      if (error.response?.status === 401) {
        setError('Email o contraseña incorrectos');
      } else if (error.response?.status === 404) {
        setError('Usuario no encontrado');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginFormContainer
      title="Bienvenido"
      subtitle="Plataforma de Gestión Educativa - Fundación Carmen Goudie"
      icon={
        <Box
          component="img"
          src={logoFundacion}
          alt="Logo Fundación Carmen Goudie"
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '3px solid rgba(238, 179, 93, 0.3)',
            p: 1,
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 8px 24px rgba(238, 179, 93, 0.2)'
          }}
        />
      }
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Input
          etiqueta="Email"
          tipo="email"
          valor={credentials.email}
          onChange={(valor) => {
            setCredentials(prev => ({
              ...prev,
              email: valor
            }));
            if (error) setError('');
          }}
          placeholder="tu@email.com"
          deshabilitado={loading}
          requerido
          error={!!error}
        />

        <Input
          etiqueta="Contraseña"
          tipo="password"
          valor={credentials.password}
          onChange={(valor) => {
            setCredentials(prev => ({
              ...prev,
              password: valor
            }));
            if (error) setError('');
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter') handleSubmit(e as unknown as React.FormEvent);
          }}
          placeholder="Tu contraseña"
          deshabilitado={loading}
          requerido
          error={!!error}
        />

        {error && (
          <Alert 
            tipo="error" 
            mensaje={error}
            onCerrar={() => {}}
            sx={{ mt: 1 }}
          />
        )}

        <Button
          variante="primary"
          tamano="lg"
          type="submit"
          deshabilitado={loading}
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
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>

        <Stack spacing={1} sx={{ mt: 2, textAlign: 'center' }}>
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => setShowPasswordRecovery(true)}
            sx={{
              color: '#667eea',
              textDecoration: 'underline',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
              '&:hover': {
                color: '#764ba2'
              }
            }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => navigate('/login-admin')}
            sx={{
              color: '#667eea',
              textDecoration: 'underline',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
              '&:hover': {
                color: '#764ba2'
              }
            }}
          >
            Acceso Administrador
          </Link>
        </Stack>
      </Box>

      <PasswordRecoveryModal
        abierto={showPasswordRecovery}
        onCerrar={() => setShowPasswordRecovery(false)}
        onSuccess={() => {
          setError('');
          // Optionally show a success message or redirect
        }}
      />
    </LoginFormContainer>
  );
}