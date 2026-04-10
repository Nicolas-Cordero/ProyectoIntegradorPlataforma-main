/**
 * Barra de navegación superior del Dashboard
 * Muestra logo, navegación y acciones del usuario
 */
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Box, Button, Chip, useMediaQuery, useTheme } from '@mui/material';
import {
  People as PeopleIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import logoFundacion from '../../../assets/logos/logo.svg';
import { GradientButton } from '../../common/GradientButton';
import { TypingText } from '../../common/TypingText';
import './DashboardNavbar.css';

interface DashboardNavbarProps {
  usuario: any;
  onLogout: () => void;
}

export function DashboardNavbar({ usuario, onLogout }: DashboardNavbarProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const showAdminChip = useMediaQuery(theme.breakpoints.up('lg'));
  // Verificar role de manera flexible (compatibilidad temporal)
  const userRole = usuario?.role || usuario?.tipo || usuario?.rol;
  const isAdmin = userRole === 'admin';

  // Log para debug
  console.log('🔍 Usuario en navbar:', usuario);
  console.log('🔍 Role detectado:', userRole);
  console.log('🔍 Es admin?:', isAdmin);

  return (
    <AppBar
      position="relative"
      elevation={0}
      className="navbar-blur-effect"
      sx={{
        zIndex: 20,
        background: `
          linear-gradient(135deg, #65B39B 0%, #5a9d89 50%, #4f8a77 100%),
          radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.1) 0%, transparent 50%)
        `,
        backgroundAttachment: 'fixed',
        color: 'white',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: `
          0 8px 32px 0 rgba(31, 38, 135, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.2)
        `,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          pointerEvents: 'none'
        }
      }}
    >
      <Toolbar sx={{ 
        px: { xs: 1.5, sm: 2, md: 3 }, 
        py: { xs: 1, md: 1.5 }, 
        minHeight: 'auto', 
        alignItems: 'center', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: { xs: 0.75, md: 2 },
        position: 'relative',
        zIndex: 1
      }}>
        {/* Fila 1: Logo + Fundación Carmen Goudie + Gestión de Usuarios */}
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: { xs: 0.75, sm: 1, md: 1.5 }, width: { xs: '100%', md: 'auto' }, flexGrow: { xs: 1, md: 1 } }}>
          <Box
            className="navbar-logo"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              '&:hover': { opacity: 0.9 },
              flexShrink: 0,
            }}
            onClick={() => navigate('/dashboard')}
          >
            <Box
              component="img"
              src={logoFundacion}
              alt="Logo Fundación"
              sx={{
                width: { xs: 40, sm: 56, md: 64 },
                height: { xs: 40, sm: 56, md: 64 },
                cursor: 'pointer',
                objectFit: 'contain',
                flexShrink: 0,
                '&:hover': { opacity: 0.9 }
              }}
              onClick={() => navigate('/dashboard')}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1 }}>
              <TypingText
                component="span"
                className="navbar-text"
                text="Fundación"
                startDelayMs={0}
                charDelayMs={1}
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '0.7rem', sm: '0.85rem', md: '0.95rem', lg: '1rem' },
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  textShadow: '0 2px 5px rgba(0, 0, 0, 0.34), 0 0 1px rgba(0, 0, 0, 0.18)',
                }}
              />
              <TypingText
                component="span"
                className="navbar-text"
                text="Carmen Goudie"
                startDelayMs={15}
                charDelayMs={1}
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '0.7rem', sm: '0.85rem', md: '0.95rem', lg: '1rem' },
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  textShadow: '0 2px 5px rgba(0, 0, 0, 0.34), 0 0 1px rgba(0, 0, 0, 0.18)',
                }}
              />
            </Box>
          </Box>

          {/* Gestión de Usuarios - Empujado a la derecha */}
          {isAdmin && (
            <Box sx={{ ml: 'auto', flexShrink: 0 }}>
              <GradientButton
                className="gradient-subtle-hover"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/admin/usuarios')}
                fullWidth={false}
                gradientVariant={1}
                sx={{ minHeight: { xs: 40, sm: 48, md: 72 }, minWidth: { xs: 100, sm: 150, md: 280 }, fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' }, flexShrink: 0 }}
              >
                Gestión de Usuarios
              </GradientButton>
            </Box>
          )}
        </Box>

        {/* Fila 2: Información de usuario y acciones */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 0.75, md: 1 }, ml: { xs: 0, md: 'auto' }, flexShrink: 0, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
          {showAdminChip && (
            <Chip
              label={
                <Box component="span">
                  <Box component="span" sx={{ opacity: 0.8 }}>{userRole || 'Usuario'}:</Box>
                  {' '}
                  <Box component="span" sx={{ fontWeight: 600 }}>{usuario?.email || 'Cargando...'}</Box>
                </Box>
              }
              sx={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                color: 'white',
                fontSize: '0.8rem',
                height: 30,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '& .MuiChip-label': {
                  px: 1.25,
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.18)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1)'
                }
              }}
            />
          )}

          <Button
            variant="text"
            className="navbar-button button-wave-effect"
            startIcon={<AccountCircleIcon />}
            onClick={() => navigate('/perfil')}
            title="Ver perfil"
            sx={{
              color: 'white',
              textTransform: 'none',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              minHeight: { xs: 38, sm: 42, md: 44 },
              px: { xs: 0.5, sm: 1, md: 1.5 },
              fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' },
              flex: { xs: 1, md: 'none' },
              '& .MuiButton-startIcon': {
                mr: { xs: 0.3, sm: 0.5, md: 0.75 },
                '& svg': {
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                },
              },
              whiteSpace: 'nowrap',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.06)',
                transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              },
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                transform: 'translateY(-1px)',
                '&::before': {
                  left: '100%'
                }
              }
            }}
          >
            Perfil
          </Button>

          <Button
            variant="contained"
            className="navbar-button button-wave-effect"
            startIcon={<LogoutIcon />}
            onClick={onLogout}
            sx={{
              background: 'linear-gradient(135deg, #C7654F 0%, #a84a38 100%)',
              color: 'white',
              textTransform: 'none',
              fontWeight: 500,
              minHeight: { xs: 38, sm: 42, md: 44 },
              px: { xs: 0.5, sm: 1, md: 1.5 },
              fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' },
              flex: { xs: 1, md: 'none' },
              '& .MuiButton-startIcon': {
                mr: { xs: 0.3, sm: 0.5, md: 0.75 },
                '& svg': {
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                },
              },
              whiteSpace: 'nowrap',
              lineHeight: 1,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 12px rgba(199, 101, 79, 0.25)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 0,
                height: 0,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                transform: 'translate(-50%, -50%)',
                transition: 'width 0.6s ease-out, height 0.6s ease-out'
              },
              '&:hover': {
                background: 'linear-gradient(135deg, #a84a38 0%, #8a3829 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 8px 24px rgba(199, 101, 79, 0.35)',
                transform: 'translateY(-1px)',
                '&::before': {
                  width: '160px',
                  height: '160px'
                }
              },
              '&:active': {
                transform: 'translateY(0px)'
              }
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
