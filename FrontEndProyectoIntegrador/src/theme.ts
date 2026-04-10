import { createTheme } from '@mui/material/styles';

/**
 * Tema personalizado de Material-UI con colores de Fundación Carmen Gaudié
 * Colores principales: Verde (#65B39B), Rojo (#C7654F), Amarillo (#ECB876), Café (#D3C483)
 */
export const theme = createTheme({
  palette: {
    primary: {
      main: '#65B39B', // Verde Fundación
      light: '#8FD4BB', // Verde claro
      dark: '#4A9B7D', // Verde oscuro
      contrastText: '#fff',
    },
    secondary: {
      main: '#C7654F', // Rojo Fundación
      light: '#E89080',
      dark: '#A04A38', // Rojo oscuro
      contrastText: '#fff',
    },
    error: {
      main: '#C7654F', // Rojo para errores
      light: '#E89080',
      dark: '#A04A38',
    },
    warning: {
      main: '#ECB876', // Amarillo Fundación
      light: '#F5D4A0',
      dark: '#D69D51', // Amarillo oscuro
    },
    info: {
      main: '#65B39B', // Verde para info
      light: '#8FD4BB',
      dark: '#4A9B7D',
    },
    success: {
      main: '#65B39B', // Verde para success
      light: '#8FD4BB',
      dark: '#4A9B7D',
    },
    background: {
      default: '#FFFBF0', // Crema cálida suave
      paper: '#FFFEF5', // Crema blancuzca muy suave
    },
  },
  typography: {
    fontFamily: "'Assistant', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontFamily: "'Assistant', sans-serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "'Assistant', sans-serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "'Assistant', sans-serif",
      fontWeight: 600,
    },
    h4: {
      fontFamily: "'Assistant', sans-serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "'Assistant', sans-serif",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "'Assistant', sans-serif",
      fontWeight: 600,
    },
    button: {
      fontFamily: "'Assistant', sans-serif",
      fontWeight: 600,
      textTransform: 'none', // Sin mayúsculas automáticas
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(101, 179, 155, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#FFFEF5',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFEF5',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4DB6AC',
            },
          },
        },
      },
    },
  },
});
