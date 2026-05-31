import { type ReactNode } from 'react';
import { Box, Container, Paper, Typography, AppBar, Toolbar } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { GradientButton } from '../../../common/GradientButton';
import { TypingText } from '../../../common/TypingText';
import { BackgroundParticles } from '../../../common/Particles';
import logoFundacion from '../../../../assets/logos/logo-fundacion.png';
import marcoIzquierdo from '../../../../assets/frames/marco-izquierda.svg';
import marcoDerecho from '../../../../assets/frames/mardo-derecha.svg';

// Constantes para estilos reutilizables
const STYLES = {
  background: { backgroundColor: '#FFFBF0' },
  navbar: {
    background: 'linear-gradient(135deg, #65B39B 0%, #5a9d89 50%, #4f8a77 100%)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
  },
  paper: {
    background: 'linear-gradient(135deg, rgba(238, 179, 93, 0.08) 0%, rgba(238, 179, 93, 0.04) 100%)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(238, 179, 93, 0.2)',
    boxShadow: '0 20px 40px rgba(238, 179, 93, 0.15)',
    borderRadius: 3,
    animation: 'slideIn 0.8s ease-out'
  }
};

interface LoginFormContainerProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  showLogoutButton?: boolean;
  onLogout?: () => void;
  userEmail?: string;
}

/**
 * Componente contenedor simplificado para formularios de login
 * Combina con el estilo del Dashboard principal
 */
export function LoginFormContainer({
  children,
  title,
  subtitle,
  icon,
  showLogoutButton = false,
  onLogout,
  userEmail
}: LoginFormContainerProps) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={STYLES.background}>
      {/* Marcos decorativos */}
      <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img src={marcoIzquierdo} alt="" className="absolute left-0 top-0 h-screen w-auto max-w-none opacity-35 select-none hidden md:block" />
        <img src={marcoDerecho} alt="" className="absolute right-0 top-0 h-screen w-auto max-w-none opacity-35 select-none hidden md:block" />
      </div>

      <BackgroundParticles />

      {/* Navbar opcional */}
      {showLogoutButton && (
        <AppBar position="relative" elevation={0} sx={STYLES.navbar}>
          <Toolbar sx={{ px: 3, py: 1.5, minHeight: 'auto', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <img src={logoFundacion} alt="Logo Fundación" style={{ width: 40, height: 40 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <TypingText text="Fundación" startDelayMs={0} charDelayMs={1} sx={{ fontSize: '0.85rem', fontWeight: 'bold' }} />
                <TypingText text="Carmen Goudie" startDelayMs={15} charDelayMs={1} sx={{ fontSize: '0.85rem', fontWeight: 'bold' }} />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto', flexShrink: 0 }}>
              {userEmail && <Typography variant="body2" sx={{ color: 'white', opacity: 0.9, fontSize: '0.8rem' }}>{userEmail}</Typography>}
              {onLogout && <GradientButton startIcon={<LogoutIcon />} onClick={onLogout} gradientVariant={1} sx={{ minHeight: 36, fontSize: '0.75rem' }}>Salir</GradientButton>}
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Contenido principal */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-8">
        <Container maxWidth="sm">
          <Paper sx={STYLES.paper} className="p-6 md:p-8">
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              {icon && <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>{icon}</Box>}
              <TypingText
                component="h1"
                text={title}
                startDelayMs={200}
                charDelayMs={2}
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  fontWeight: 700,
                  mb: 1,
                  background: 'linear-gradient(135deg, #65B39B 0%, #EEB35D 50%, #C7654F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              />
              {subtitle && <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500 }}>{subtitle}</Typography>}
            </Box>

            {children}
          </Paper>
        </Container>
      </div>
    </div>
  );
};
