import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Link,
  CircularProgress
} from '@mui/material';
import { Input, Alert, Button } from '../../../../components/ui';
import { authService } from '../../../../services/authService';
import type { LoginCredentials } from '../../../../types';
import { logger } from '../../../../config';
import { isValidEmail } from '../../../../utils/validators';
import { LoginFormContainer } from '../shared';
import { PasswordRecoveryModal } from '../password-recovery';
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
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);

  const navigate = useNavigate();

  const handleInputChangeSimple = (field: string, value: string) => {
    const { name } = { name: field } as any;
    setCredentials(prev => ({
      ...prev,
      [field]: value
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
      title="Acceso Administrativo"
      subtitle="Panel de Gestión - Fundación Carmen Goudie"
      icon={
        <Box
          component="img"
          src={logoFundacion}
          alt="Logo Fundación Carmen Goudie"
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '3px solid rgba(101, 179, 155, 0.3)',
            p: 1,
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 8px 24px rgba(101, 179, 155, 0.2)'
          }}
        />
      }
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Input
          tipo="email"
          etiqueta="Email de Administrador"
          valor={credentials.email}
          onChange={(v) => handleInputChangeSimple('email', v)}
          placeholder="admin@fundacion.cl"
          deshabilitado={loading}
          requerido
          error={!!error}
          sx={{
            backgroundColor: '#f8f9fa'
          }}
        />

        <Input
          tipo="password"
          etiqueta="Contraseña de Administrador"
          valor={credentials.password}
          onChange={(v) => handleInputChangeSimple('password', v)}
          placeholder="Contraseña segura"
          deshabilitado={loading}
          requerido
          error={!!error}
          sx={{
            backgroundColor: '#f8f9fa'
          }}
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
          deshabilitado={loading}
          onClick={(e: any) => { e.preventDefault(); handleSubmit(e as any); }}
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
            onClick={() => setShowPasswordRecovery(true)}
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
};