import React from 'react';
import { Box, Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import buttonExampleBackground from '../../assets/button-example-bg.svg';
import buttonGradientV2 from '../../assets/button-gradient-v2.svg';
import buttonGradientV3 from '../../assets/button-gradient-v3.svg';
import buttonGradientV4 from '../../assets/button-gradient-v4.svg';
import buttonGradientV5 from '../../assets/button-gradient-v5.svg';
import buttonGradientV6 from '../../assets/button-gradient-v6.svg';

interface GradientButtonProps extends Omit<ButtonProps, 'variant'> {
  children: React.ReactNode;
  onClick?: () => void;
  startIcon?: React.ReactNode;
  fullWidth?: boolean;
  gradientVariant?: 1 | 2 | 3 | 4 | 5 | 6;
}

const gradientVariants = {
  1: buttonExampleBackground,
  2: buttonGradientV2,
  3: buttonGradientV3,
  4: buttonGradientV4,
  5: buttonGradientV5,
  6: buttonGradientV6,
};

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onClick,
  startIcon: _startIcon,
  fullWidth = false,
  gradientVariant = 1,
  ...props
}) => {
  void _startIcon;

  const backgroundImage = gradientVariants[gradientVariant];

  return (
    <Button
      {...props}
      onClick={onClick}
      fullWidth={fullWidth}
      variant="contained"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        width: fullWidth ? '100%' : { xs: '100%', sm: 'auto' },
        minWidth: fullWidth ? '100%' : { xs: 0, sm: 240, md: 280 },
        minHeight: { xs: 56, sm: 72 },
        px: 0,
        py: 0,
        border: 'none',
        backgroundColor: 'transparent',
        color: 'white',
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: '999px',
        fontSize: { xs: '14px', sm: '16px' },
        lineHeight: 1,
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
        ...props.sx,
      }}
    >
      <Box
        component="span"
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '999px',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <Box
          component="img"
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          sx={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'cover',
            objectPosition: 'center',
            userSelect: 'none',
          }}
        />
      </Box>

      <Box
        component="span"
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: fullWidth ? 4.5 : 3.5 },
          color: '#fff',
          fontFamily: "'Assistant', 'Open Sans', sans-serif",
          fontSize: { xs: '0.92rem', sm: 'clamp(0.95rem, 1.1vw, 1.25rem)' },
          fontWeight: 700,
          letterSpacing: '0.01em',
          textAlign: 'center',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          textShadow: '0 3px 5px rgba(0, 0, 0, 0.38), 0 0 1px rgba(0, 0, 0, 0.2)',
          WebkitTextStroke: '0.2px rgba(0, 0, 0, 0.02)',
          lineHeight: 1.2,
          pointerEvents: 'none',
        }}
      >
        {children}
      </Box>
    </Button>
  );
};
