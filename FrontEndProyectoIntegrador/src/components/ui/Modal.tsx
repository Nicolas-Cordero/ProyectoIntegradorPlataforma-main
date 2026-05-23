import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ModalProps {
  titulo?: string;
  abierto: boolean;
  onCerrar: () => void;
  children: React.ReactNode;
  acciones?: React.ReactNode;
  tamanio?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  mostrarBotonCerrar?: boolean;
}

const mapaTamanos: Record<string, string> = {
  xs: '280px',
  sm: '420px',
  md: '600px',
  lg: '800px',
  xl: '1000px',
};

export const Modal: React.FC<ModalProps> = ({
  titulo,
  abierto,
  onCerrar,
  children,
  acciones,
  tamanio = 'md',
  mostrarBotonCerrar = true,
}) => {
  return (
    <Dialog
      open={abierto}
      onClose={onCerrar}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: mapaTamanos[tamanio],
          maxHeight: '90vh',
          borderRadius: 2,
          backgroundColor: '#FFFEF5',
        },
      }}
    >
      {titulo && (
        <DialogTitle
          sx={{
            fontFamily: "'Assistant', 'Open Sans', sans-serif",
            fontWeight: 600,
            fontSize: '1.25rem',
            color: '#333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pr: mostrarBotonCerrar ? 1 : 2,
          }}
        >
          {titulo}
          {mostrarBotonCerrar && (
            <IconButton
              onClick={onCerrar}
              size="small"
              sx={{
                color: '#666',
                '&:hover': {
                  backgroundColor: 'rgba(101, 179, 155, 0.1)',
                },
              }}
              aria-label="Cerrar diálogo"
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent
        sx={{
          fontFamily: "'Assistant', 'Open Sans', sans-serif",
          fontSize: '0.95rem',
          color: '#555',
          py: titulo ? 2 : 3,
        }}
      >
        {children}
      </DialogContent>
      {acciones && (
        <DialogActions
          sx={{
            p: 2,
            borderTop: '1px solid #e0e0e0',
            gap: 1,
          }}
        >
          {acciones}
        </DialogActions>
      )}
    </Dialog>
  );
};
