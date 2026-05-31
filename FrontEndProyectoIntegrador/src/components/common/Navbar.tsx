// src/components/common/Navbar.tsx

import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Box, Button, Chip, useMediaQuery, useTheme } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import logoFundacion from '../../assets/logos/logo.svg';
import { GradientButton } from './GradientButton';
import { TypingText } from './TypingText';

export interface NavLink {
  label: string;
  path: string;
}

interface NavbarProps {
  usuario: any;
  onLogout: () => void;
  links?: NavLink[];
}

export function Navbar({ usuario, onLogout, links = [] }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const showAdminChip = useMediaQuery(theme.breakpoints.up('lg'));
  const userRole = usuario?.role || usuario?.tipo || usuario?.rol;

  return (
    <>
      <AppBar
        position="relative"
        elevation={0}
        sx={{
          zIndex: 20,
          background: `
            linear-gradient(135deg, #65B39B 0%, #5a9d89 50%, #4f8a77 100%),
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0,0,0,0.1) 0%, transparent 50%)
          `,
          color: 'white',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            pointerEvents: 'none'
          }
        }}
      >
        <Toolbar sx={{
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 1, md: 1.5 },
          minHeight: 'auto',
          alignItems: 'center',
          gap: { xs: 0.75, md: 2 },
          position: 'relative',
          zIndex: 1
        }}>

          {/* Logo */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', flexShrink: 0 }}
            onClick={() => navigate('/estudiantes')}
          >
            <Box
              component="img"
              src={logoFundacion}
              alt="Logo Fundación"
              sx={{
                width: { xs: 40, sm: 56, md: 64 },
                height: { xs: 40, sm: 56, md: 64 },
                objectFit: 'contain',
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <TypingText
                component="span"
                text="Fundación"
                startDelayMs={0}
                charDelayMs={1}
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '0.7rem', sm: '0.85rem', md: '0.95rem', lg: '1rem' },
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  textShadow: '0 2px 5px rgba(0,0,0,0.34)',
                }}
              />
              <TypingText
                component="span"
                text="Carmen Goudie"
                startDelayMs={15}
                charDelayMs={1}
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '0.7rem', sm: '0.85rem', md: '0.95rem', lg: '1rem' },
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  textShadow: '0 2px 5px rgba(0,0,0,0.34)',
                }}
              />
            </Box>
          </Box>

          {/* Usuario + Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto', flexShrink: 0 }}>
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
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  fontSize: '0.8rem',
                  height: 30,
                  border: '1px solid rgba(255,255,255,0.2)',
                  '& .MuiChip-label': { px: 1.25 },
                  '&:hover': { background: 'rgba(255,255,255,0.18)' }
                }}
              />
            )}

            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={onLogout}
              sx={{
                background: 'linear-gradient(135deg, #C7654F 0%, #a84a38 100%)',
                color: 'white',
                textTransform: 'none',
                fontWeight: 500,
                minHeight: { xs: 38, sm: 42, md: 44 },
                px: { xs: 1, md: 1.5 },
                fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' },
                whiteSpace: 'nowrap',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(199,101,79,0.25)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #a84a38 0%, #8a3829 100%)',
                  transform: 'translateY(-1px)',
                },
                '&:active': { transform: 'translateY(0px)' }
              }}
            >
              Cerrar Sesión
            </Button>
          </Box>

        </Toolbar>
      </AppBar>

    {/* Barra de navegación secundaria */}
    {links.length > 0 && (
      <Box sx={{ 
        bgcolor: 'white', 
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        justifyContent: 'center'
      }}>
        {links.map((link) => (
          <Button
            key={link.path}
            onClick={() => navigate(link.path)}
            sx={{
              color: location.pathname === link.path ? '#65B39B' : '#555',
              textTransform: 'none',
              fontWeight: location.pathname === link.path ? 700 : 500,
              fontSize: '0.9rem',
              px: 3,
              py: 1.5,
              borderRadius: 0,
              borderBottom: location.pathname === link.path
                ? '2px solid #65B39B'
                : '2px solid transparent',
              transition: 'all 0.2s ease',
              '&:hover': { 
                color: '#65B39B',
                background: 'rgba(101,179,155,0.06)' 
              }
            }}
          >
            {link.label}
          </Button>
        ))}
      </Box>
    )}
    </>
  );
}