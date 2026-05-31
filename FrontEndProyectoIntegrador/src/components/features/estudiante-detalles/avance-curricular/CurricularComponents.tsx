import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';

// 🎨 COMPONENTES STYLED PARA MALLA CURRICULAR

export const SemesterCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '8px',
  backgroundColor: '#FFFEF5',
  border: '1px solid #e9ecef',
  minHeight: '600px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  '& .semester-header': {
    backgroundColor: '#dde7eaff',
    color: 'black',
    padding: theme.spacing(1),
    borderRadius: '4px',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    '&:hover .semester-config-button': {
      opacity: 1,
    },
  },
  '& .semester-title': {
    flex: 1,
    textAlign: 'center',
  },
  '& .semester-config-button': {
    position: 'absolute',
    right: 4,
    opacity: 0,
    transition: 'opacity 0.2s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 24,
    height: 24,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      transform: 'scale(1.1)',
    },
  },
  '& .semester-info': {
    fontSize: '0.75rem',
    color: '#666',
    textAlign: 'center',
    marginTop: '4px',
  },
  '& .add-subject-button': {
    position: 'absolute',
    bottom: '8px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '20px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    '&:hover': {
      backgroundColor: '#45a049',
      transform: 'translateX(-50%) scale(1.1)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    },
  },
}));

export const SubjectCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'estado',
})<{ estado: string }>(({ theme, estado }) => {
  const getColors = () => {
    switch (estado) {
      case 'aprobado':
        return {
          background: '#d4edda',
          border: '#28a745',
          borderLeft: '#155724',
          textColor: '#155724'
        };
      case 'reprobado':
        return {
          background: '#f8d7da',
          border: '#dc3545',
          borderLeft: '#721c24',
          textColor: '#721c24'
        };
      case 'cursando':
        return {
          background: '#fff3cd',
          border: '#ffc107',
          borderLeft: '#856404',
          textColor: '#856404'
        };
      case 'pendiente':
        return {
          background: 'white',
          border: '#6c757d',
          borderLeft: '#495057',
          textColor: '#495057'
        };
      default:
        return {
          background: 'white',
          border: '#dee2e6',
          borderLeft: '#6c757d',
          textColor: '#6c757d'
        };
    }
  };

  const colors = getColors();

  return {
    padding: theme.spacing(1.5),
    margin: theme.spacing(0.5, 0),
    borderRadius: '4px',
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderLeft: `6px solid ${colors.borderLeft}`,
    borderBottom: `4px solid ${colors.borderLeft}`,
    minHeight: '80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    boxShadow: `
      inset -2px 0 0 0 rgba(0,0,0,0.1),
      inset 0 -2px 0 0 rgba(0,0,0,0.1),
      2px 2px 4px rgba(0,0,0,0.1)
    `,
    '&:hover': {
      transform: 'translateX(2px) translateY(-2px)',
      boxShadow: `
        inset -3px 0 0 0 rgba(0,0,0,0.15),
        inset 0 -3px 0 0 rgba(0,0,0,0.15),
        4px 4px 8px rgba(0,0,0,0.2)
      `,
      '& .edit-button': {
        opacity: 1,
      },
      '& .delete-button': {
        opacity: 1,
      },
    },
    '& .subject-code': {
      fontSize: '12px',
      fontWeight: 'bold',
      color: colors.textColor,
      marginBottom: '4px',
    },
    '& .subject-name': {
      fontSize: '11px',
      color: '#333',
      lineHeight: 1.2,
      marginBottom: '8px',
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
    },
    '& .subject-footer': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '10px',
      color: '#666',
    },
    '& .edit-button': {
      position: 'absolute',
      top: '4px',
      right: '4px',
      opacity: 0,
      transition: 'opacity 0.2s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '2px',
      borderRadius: '50%',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 1)',
      },
    },
    '& .delete-button': {
      position: 'absolute',
      top: '4px',
      right: '30px',
      opacity: 0,
      transition: 'opacity 0.2s ease',
      backgroundColor: 'rgba(244, 67, 54, 0.9)',
      color: 'white',
      padding: '2px',
      borderRadius: '50%',
      '&:hover': {
        backgroundColor: 'rgba(244, 67, 54, 1)',
        transform: 'scale(1.1)',
      },
    },
    '& .opportunity-indicator': {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: '#ff6b35',
      color: 'white',
      fontSize: '10px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      zIndex: 10,
    },
  };
});

export const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
}));