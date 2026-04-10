import React from 'react';
import { Box, Alert, AlertTitle, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorMessageProps {
  title?: string;
  message: string;
  fullScreen?: boolean;
  onRetry?: () => void;
  showIcon?: boolean;
}

/**
 * Componente reutilizable para mostrar mensajes de error
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title = 'Error',
  message,
  fullScreen = false,
  onRetry,
  showIcon = true
}) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight={fullScreen ? '100vh' : '200px'}
      p={3}
    >
      <Alert 
        severity="error" 
        icon={showIcon ? <ErrorOutlineIcon /> : false}
        sx={{ maxWidth: 600 }}
      >
        <AlertTitle sx={{ fontWeight: 'bold' }}>{title}</AlertTitle>
        {message}
        {onRetry && (
          <Box mt={2}>
            <Button 
              variant="outlined" 
              color="error" 
              size="small"
              onClick={onRetry}
            >
              Reintentar
            </Button>
          </Box>
        )}
      </Alert>
    </Box>
  );
};
